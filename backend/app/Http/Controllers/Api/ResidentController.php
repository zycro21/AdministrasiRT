<?php

namespace App\Http\Controllers\Api;

use App\Models\Resident;
use App\Models\HouseResident;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreResidentRequest;
use App\Http\Requests\UpdateResidentRequest;

class ResidentController extends Controller
{
    public function index(): JsonResponse
    {
        $residents = Resident::latest()
            ->when(request('search'), function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('full_name', 'like', "%{$search}%")
                        ->orWhere('phone_number', 'like', "%{$search}%");
                });
            })
            ->paginate(10);

        return response()->json($residents);
    }

    public function show(Resident $resident): JsonResponse
    {
        return response()->json($resident);
    }

    public function store(
        StoreResidentRequest $request
    ): JsonResponse {
        $data = $request->validated();

        $data['ktp_photo'] = $request
            ->file('ktp_photo')
            ->store('ktp', 'public');

        $resident = Resident::create($data);

        return response()->json([
            'message' => 'Resident berhasil dibuat',
            'data' => $resident,
        ], 201);
    }

    public function update(
        UpdateResidentRequest $request,
        Resident $resident
    ): JsonResponse {
        $data = $request->validated();

        if ($request->hasFile('ktp_photo')) {

            if (
                $resident->ktp_photo &&
                Storage::disk('public')->exists(
                    $resident->ktp_photo
                )
            ) {
                Storage::disk('public')->delete(
                    $resident->ktp_photo
                );
            }

            $data['ktp_photo'] = $request
                ->file('ktp_photo')
                ->store('ktp', 'public');
        }

        $resident->update($data);

        return response()->json([
            'message' => 'Resident berhasil diupdate',
            'data' => $resident,
        ]);
    }

    public function destroy(
        Resident $resident
    ): JsonResponse {

        if (
            $resident->ktp_photo &&
            Storage::disk('public')->exists(
                $resident->ktp_photo
            )
        ) {
            Storage::disk('public')->delete(
                $resident->ktp_photo
            );
        }

        $resident->delete();

        return response()->json([
            'message' => 'Resident berhasil dihapus',
        ]);
    }

    public function detail(
        Resident $resident
    ): JsonResponse {

        $resident->load([
            'houseResidents' => function ($query) {
                $query
                    ->with('house')
                    ->orderByDesc('start_date');
            },

            'monthlyBills.paymentType',
            'monthlyBills.payments',

            'payments.paymentType',
            'payments.house',
        ]);

        return response()->json([
            'data' => $resident,
        ]);
    }

    public function stats(): JsonResponse
    {
        $total = Resident::count();

        $active = HouseResident::where('is_active', true)
            ->distinct('resident_id')
            ->count('resident_id');

        return response()->json(compact('total', 'active'));
    }
}
