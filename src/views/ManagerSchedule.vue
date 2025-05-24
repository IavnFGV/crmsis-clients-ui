<script setup>
import {ref, computed} from "vue";


const daysShort = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];


const managers = ref([
    {
        id: "1",
        name: "Evgeniy",
        email: "zabolotniy.evgeniy@gmail.com",
        role: "owner",
        workHours: "00:00 — 00:00",
        workDays: [false, false, false, false, false, false, false],
        salesPlan: 0,
        callPlan: 0,
        minutesPlan: 0,
    },
]);

const filter = ref("");

const filteredManagers = computed(() =>
    managers.value.filter((m) =>
        m.name.toLowerCase().includes(filter.value.toLowerCase())
    )
);

function addManager() {
    managers.value.push({
        id: Math.random().toString(36).slice(2),
        name: "",
        email: "",
        role: "user",
        workHours: "00:00 — 00:00",
        workDays: [false, false, false, false, false, false, false],
        salesPlan: 0,
        callPlan: 0,
        minutesPlan: 0,
    });
}

function removeManager(index) {
    managers.value.splice(index, 1);
}

function submit() {
    const payload = managers.value.map((m) => ({
        id: m.id,
        role: m.role,
        workHours: m.workHours,
        workDays: m.workDays,
        salesPlan: m.salesPlan,
        callPlan: m.callPlan,
        minutesPlan: m.minutesPlan,
    }));
    console.log("Submit payload:", JSON.stringify(payload, null, 2));
}
</script>

<template>
    <div class="p-4 space-y-4">
        <div class="flex justify-between items-center">
            <input v-model="filter" placeholder="Manager" class="border p-1 rounded"/>
            <button @click="addManager" class="ml-2 px-3 py-1 bg-blue-600 text-white rounded">+ Add</button>
        </div>
        <div class="grid items-end gap-2 grid-cols-[2fr_1fr_2fr_repeat(7,2rem)_1fr_1fr_1fr_auto] font-semibold text-gray-600 px-2">
            <div>Manager</div>
            <div>Role</div>
            <div>Work hours</div>
            <!-- Days row (empty on top) + short names -->
            <div class="col-span-7 text-center">
                <div class="text-sm mb-1">Work days</div>
                <div class="grid grid-cols-7 gap-1">
      <span v-for="(d, i) in ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']"
            :key="i"
            class="text-center text-xs text-gray-500">
        {{ d }}
      </span>
                </div>
            </div>
            <div>Sales plan</div>
            <div>Call plan</div>
            <div>Minutes plan</div>
            <div class="w-8"></div> <!-- Пустая ячейка под корзину -->
        </div>
        <div
            v-for="(entry, index) in filteredManagers"
            :key="entry.id"
            class="grid items-center gap-2 grid-cols-[2fr_1fr_2fr_repeat(7,2rem)_1fr_1fr_1fr_auto] bg-gray-100 p-2 rounded"
        >
            <!-- Manager info -->
            <div>
                <p class="font-medium">{{ entry.name }}</p>
                <p class="text-sm text-gray-500">{{ entry.email }}</p>
            </div>

            <!-- Role -->
            <div>
                <select v-model="entry.role" class="w-full border rounded px-1">
                    <option value="owner">Owner</option>
                    <option value="manager">Manager</option>
                    <option value="user">User</option>
                </select>
            </div>

            <!-- Work hours -->
            <div>
                <input type="text" v-model="entry.workHours" class="w-full border rounded px-1" />
            </div>

            <!-- Work days checkboxes -->
            <div v-for="(day, i) in 7" :key="i">
                <input type="checkbox" v-model="entry.workDays[i]" class="mx-auto block h-4 w-4" />
            </div>

            <!-- Sales / Call / Minutes plan -->
            <div>
                <input type="number" v-model.number="entry.salesPlan" class="w-full border rounded px-1" />
            </div>
            <div>
                <input type="number" v-model.number="entry.callPlan" class="w-full border rounded px-1" />
            </div>
            <div>
                <input type="number" v-model.number="entry.minutesPlan" class="w-full border rounded px-1" />
            </div>

            <!-- Remove icon -->
            <div class="w-8 text-center">
                <button
                    @click="removeManager(index)"
                    class="p-1 text-red-600 hover:text-red-800"
                    aria-label="Remove"
                >
                    <span class="pi pi-trash text-lg" />
                </button>
            </div>
        </div>


        <div class="text-right pt-4">
            <button @click="submit" class="px-4 py-2 bg-green-600 text-white rounded">Save Configuration</button>
        </div>
    </div>
</template>
