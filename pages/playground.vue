<template>
  <div>
    <DataTable :value="products" tableStyle="min-width: 50rem">
      <Column field="code" header="Code" sortable style="width: 25%"></Column>
      <Column field="name" header="Name" sortable style="width: 25%"></Column>
      <Column field="category" header="Category" sortable style="width: 25%"></Column>
      <Column field="quantity" header="Quantity" sortable style="width: 25%"></Column>
    </DataTable>
  </div>
</template>

<script setup lang="ts">
const products = ref([
  { code: 'A1', name: 'Data Table', category: 'Component', quantity: 10 },
  { code: 'A2', name: 'Data List', category: 'Component', quantity: 20 },
  { code: 'A3', name: 'Data View', category: 'Component', quantity: 30 },
  { code: 'A4', name: 'Data Scroller', category: 'Component', quantity: 40 },
  { code: 'A5', name: 'Data Grid', category: 'Component', quantity: 50 },
])
</script>
