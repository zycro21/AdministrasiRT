<?php

namespace App\Http\Controllers\Api;

use App\Models\House;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreHouseRequest;
use App\Http\Requests\UpdateHouseRequest;
use App\Models\HouseResident;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use App\Http\Requests\AssignResidentRequest;
use App\Http\Requests\ReplaceResidentsRequest;

class HouseController extends Controller
{
    public function index(): JsonResponse
    {
        $houses = House::latest()
            ->when(request('search'), function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('house_number', 'like', "%{$search}%")
                        ->orWhere('address', 'like', "%{$search}%");
                });
            })
            ->paginate(request('per_page', 10));

        return response()->json($houses);
    }

    public function show(
        House $house
    ): JsonResponse {

        return response()->json([
            'data' => $house,
        ]);
    }

    public function store(
        StoreHouseRequest $request
    ): JsonResponse {

        $house = House::create(
            $request->validated()
        );

        return response()->json([
            'message' => 'House berhasil dibuat',
            'data' => $house,
        ], 201);
    }

    public function update(
        UpdateHouseRequest $request,
        House $house
    ): JsonResponse {

        $house->update(
            $request->validated()
        );

        return response()->json([
            'message' => 'House berhasil diupdate',
            'data' => $house,
        ]);
    }

    public function detail(
        House $house
    ): JsonResponse {

        $house->load([
            'houseResidents' => function ($query) {
                $query
                    ->with('resident')
                    ->orderByDesc('start_date');
            },

            'monthlyBills' => function ($query) {
                $query
                    ->with([
                        'resident',
                        'paymentType',
                        'payments',
                    ])
                    ->latest();
            },

            'payments' => function ($query) {
                $query
                    ->with([
                        'resident',
                        'paymentType',
                        'monthlyBill',
                    ])
                    ->latest();
            },
        ]);

        $currentResidents = $house
            ->houseResidents
            ->where('is_active', true)
            ->values();

        return response()->json([
            'house' => [
                'id' => $house->id,
                'house_number' => $house->house_number,
                'address' => $house->address,
                'occupancy_status' => $house->occupancy_status,
                'created_at' => $house->created_at,
                'updated_at' => $house->updated_at,
            ],
            'current_residents' => $currentResidents,
            'resident_history' => $house->houseResidents,
            'monthly_bills' => $house->monthlyBills,
            'payments' => $house->payments,
        ]);
    }

    public function destroy(
        House $house
    ): JsonResponse {

        $house->delete();

        return response()->json([
            'message' => 'House berhasil dihapus',
        ]);
    }

    public function stats(): JsonResponse
    {
        $total   = House::count();
        $occupied = House::where('occupancy_status', 'occupied')->count();
        $vacant   = House::where('occupancy_status', 'vacant')->count();

        return response()->json(compact('total', 'occupied', 'vacant'));
    }

    public function assignResident(
        AssignResidentRequest $request,
        House $house
    ): JsonResponse {

        return DB::transaction(function () use (
            $request,
            $house
        ) {

            $data = $request->validated();

            $existingResident = HouseResident::where(
                'house_id',
                $house->id
            )
                ->where(
                    'resident_id',
                    $data['resident_id']
                )
                ->where(
                    'is_active',
                    true
                )
                ->exists();

            if ($existingResident) {

                return response()->json([
                    'message' => 'Resident sudah aktif di rumah ini.'
                ], 422);
            }

            $houseResident = HouseResident::create([
                'house_id' => $house->id,
                'resident_id' => $data['resident_id'],
                'start_date' => $data['start_date'],
                'is_active' => true,
            ]);

            $house->update([
                'occupancy_status' => 'occupied',
            ]);

            return response()->json([
                'message' => 'Resident berhasil di-assign ke house',
                'data' => $houseResident->load([
                    'resident',
                    'house',
                ]),
            ]);
        });
    }

    public function replaceResidents(
        ReplaceResidentsRequest $request,
        House $house
    ): JsonResponse {

        return DB::transaction(function () use ($request, $house) {

            $data = $request->validated();

            if (count($data['resident_ids']) !== count(array_unique($data['resident_ids']))) {
                return response()->json([
                    'message' => 'Resident ID tidak boleh duplikat dalam request'
                ], 422);
            }

            $activeElsewhere = HouseResident::whereIn('resident_id', $data['resident_ids'])
                ->where('is_active', true)
                ->exists();

            if ($activeElsewhere) {
                return response()->json([
                    'message' => 'Salah satu resident masih aktif di rumah lain'
                ], 422);
            }

            $startDate = Carbon::parse($data['start_date']);

            $activeResidents = HouseResident::where('house_id', $house->id)
                ->where('is_active', true)
                ->get();

            foreach ($activeResidents as $resident) {
                $resident->update([
                    'is_active' => false,
                    'end_date' => $startDate->copy()->subDay()->toDateString(),
                ]);
            }

            // Hanya satu loop create
            $newResidentIds = [];

            foreach ($data['resident_ids'] as $residentId) {
                $hr = HouseResident::create([
                    'house_id' => $house->id,
                    'resident_id' => $residentId,
                    'start_date' => $startDate,
                    'end_date' => null,
                    'is_active' => true,
                ]);
                $newResidentIds[] = $hr->id;
            }

            $house->update(['occupancy_status' => 'occupied']);

            $newResidents = HouseResident::whereIn('id', $newResidentIds)
                ->with('resident')
                ->get();

            return response()->json([
                'message' => 'Berhasil mengganti seluruh penghuni rumah',
                'data' => [
                    'ended_residents' => $activeResidents->load('resident'),
                    'new_residents' => $newResidents,
                ]
            ]);
        });
    }
}
