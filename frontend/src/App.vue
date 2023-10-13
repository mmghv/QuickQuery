<script setup lang="ts">
import { computed, nextTick, reactive, ref } from 'vue';
import { FilterMatchMode } from 'primevue/api';
import { GetAppVersion, MssqlQuery } from '../wailsjs/go/main/App'
import Editor from './components/Editor.vue';
import AppIcon from './assets/images/appicon.png'

import type { DataTableFilterMeta } from 'primevue/datatable'

const data = reactive({
  appVersion: '',
  server: '(local)\\SQLEXPRESS',
  dbs: [] as string[],
  db: '',
  username: 'sa',
  password: '',
  query: 'SELECT GETDATE();\n\n',
  columns: [] as string[],
  rows: [] as {[key: string]: string}[],
  filters: {} as DataTableFilterMeta,
  filtersEnabled: false,
  error: '',
  loading_dbs: false,
  loading: false,
  ready: false,
  ms: 0,
  requestId: 0,
  about: false,
})

GetAppVersion().then(v => data.appVersion = v);

const filters = computed({
  get() {
    return data.filtersEnabled ? data.filters : undefined;
  },
  set(val) {
    if (data.filtersEnabled) data.filters = val ?? {};
  }
})

const toggleFilters = async (val: boolean) => {
  data.loading = true;
  await nextTick();
  setTimeout(async () => {
    data.filtersEnabled = val;
    await nextTick();
    data.loading = false;
  });
}

const get_dbs = async () => {
  const requestId = ++data.requestId;
  data.rows = [];
  data.columns = [];
  data.error = '';
  data.ready = false;
  data.loading = false;
  data.loading_dbs = true;
  try {
    const sql = "SELECT name FROM sys.databases WHERE name NOT IN ('tempdb', 'model', 'msdb')"
    const r = await MssqlQuery(data.server, data.username, data.password, 'master', sql)
    if (requestId != data.requestId) return;
    data.dbs = r.result.map(row => row.name);
    if (data.dbs.length >= 1) {
      data.db = data.dbs[1];
    }
  } catch (error) {
    if (requestId != data.requestId) return;
    data.error = String(error);
    data.dbs = [];
  }
  if (!data.dbs.includes(data.db)) {
    data.db = '';
  }
  data.loading_dbs = false;
}

const execute = async () => {
  if (data.loading_dbs) return;
  const requestId = ++data.requestId;
  data.rows = [];
  data.columns = [];
  data.error = '';
  data.ready = false;
  data.loading = true;
  await nextTick();
  const start = Date.now();
  try {
    const r = await MssqlQuery(data.server, data.username, data.password, data.db, data.query);
    if (requestId != data.requestId) return;
    if (r == null || r.result == null) {
      data.error = 'No results returned!';
    } else {
      data.rows = r.result;
      data.columns = r.columns;
      data.ms = Date.now() - start;

      data.filters = {}
      data.columns.forEach(col => {
        data.filters[col] = { value: null, matchMode: FilterMatchMode.CONTAINS }
      });
    }
  } catch (error) {
    if (requestId != data.requestId) return;
    data.error = String(error);
  }
  data.ready = true;
  data.loading = false;
}

const table = ref();

const exportCSV = () => {
  table.value.exportCSV();
}

const copyRows = async () => {
  data.loading = true;
  await nextTick();
  setTimeout(() => {
    let str = '';

    data.columns.forEach((col, i) => {
      str += (i ? "\t" : '') + col;
    });

    data.rows.forEach(row => {
      str += "\n";
      data.columns.forEach((col, i) => {
        str += (i ? "\t" : '') + row[col];
      });
    });

    navigator.clipboard.writeText(str);
    data.loading = false;
  });
}
</script>

<!-- ============================================================================= -->
<!-- ============================================================================= -->

<template>
  <div class="top" @keydown="(e) => (e.code == 'F5') && execute()">
    <div class="flex">
      <Button icon="mdi mdi-dots-vertical" iconClass="text-xl" class="mr-2 w-2rem" @click="(e) => ($refs.menu as any).toggle(e)" />
      <Menu
        :model="[
          {label: 'About', icon: 'mdi mdi-information', command: () => data.about = true},
        ]"
        popup
        ref="menu"
      />

      <InputText v-model="data.server" class="flex-1 min-w-0" title="server\instance,port" @change="get_dbs" />
      <InputText v-model="data.username" class="flex-1 min-w-0 max-w-6rem" title="user" @change="get_dbs" />
      <Password v-model="data.password" toggleMask :feedback="false" class="flex-1" inputClass="w-full" title="password" :pt="{input: {onchange: get_dbs}}" />
      <Dropdown v-model="data.db" :options="data.dbs" editable :loading="data.loading_dbs" @before-show="(data.dbs.length == 0) && get_dbs()" class="flex-1" title="database" />
    </div>
    <ProgressBar v-show="data.loading_dbs" mode="indeterminate"></ProgressBar>
    <hr/>
    <Editor
      v-model="data.query"
      class="mb-2"
    />
    <div class="flex align-items-center">
      <Button :disabled="data.loading_dbs" @click="execute">Execute (F5)</Button>

      <template v-if="data.ready && !data.error">
        <Chip :label="`${data.ms.toLocaleString('en')} ms`" icon="mdi mdi-clock-outline" title="Execute time" class="ml-2" />
        <Chip :label.string="`${data.rows.length.toLocaleString('en')} rows`" icon="mdi mdi-table" title="Rows count" class="mx-2" />

        <SplitButton label="Export CSV" icon="mdi mdi-file-export-outline" outlined @click="exportCSV" :model="[{
          label: 'Copy to clipboard',
          icon: 'mdi mdi-content-copy',
          command: copyRows,
        }]" />
      </template>

      <div class="flex-grow-1"></div>

      <Chip class="p-2" v-if="data.ready && !data.error">
        <InputSwitch inputId="filtersEnabled" class="m-1" :modelValue="data.filtersEnabled" @update:modelValue="toggleFilters" />
        <label for="filtersEnabled" class="p-1 cursor-pointer">Filters</label>
      </Chip>
    </div>
    <hr>
  </div>

  <div class="result">
    <Message v-if="data.error" severity="error" style="font-family: monospace" class="m-2">{{ data.error }}</Message>
    <DataTable
      v-else
      v-if="data.ready || data.loading"
      :value="data.rows"
      :loading="data.loading"
      v-model:filters="filters"
      :filterDisplay="data.filtersEnabled ? 'row' : undefined"
      showGridlines
      removableSort
      sortMode="multiple"
      scrollable
      scrollHeight="flex"
      :virtualScrollerOptions="{ itemSize: 35 }"
      class="white-space-nowrap p-datatable-sm"
      ref="table"
    >
      <Column v-for="col in data.columns" :field="col" :header="col" sortable :showClearButton="false">
        <template v-if="data.filtersEnabled" #filter="{ filterModel, filterCallback }">
          <InputText v-model="filterModel.value" type="text" @input="filterCallback()" class="p-1" style="min-width: 3rem" placeholder="Filter" />
        </template>
      </Column>
    </DataTable>
  </div>

  <Dialog v-model:visible="data.about" modal header="About">
    <div class="text-center">
      <img :src="AppIcon" />
      <h2 class="mt-0 m-0">QuickQuery <span class="text-xs">v{{ data.appVersion }}</span></h2>
      <p>A simple SQL database query tool</p>
      <p>© 2023 <a href="https://github.com/mmghv">Mohamed Gharib</a></p>
      <p>Open-source (MIT)</p>
      <p><a href="https://github.com/mmghv/QuickQuery">View on github <i class="mdi mdi-github text-xl"></i></a></p>
    </div>
  </Dialog>
</template>

<!-- ============================================================================= -->
<!-- ============================================================================= -->

<style>
  .top {
    flex: 0 0 auto;
  }
  .result {
    flex: 1 1 auto;
    overflow: auto;
    background-color: white;
  }

  .p-datatable .p-datatable-thead>tr>th {
    background: #ededed !important;
  }

  .p-column-filter-row .p-column-filter-menu-button, .p-column-filter-row .p-column-filter-clear-button {
    margin-left: 0 !important;
    margin-right: -0.5rem;
  }

  .p-message-wrapper > svg, .p-message-wrapper > button {
    flex-shrink: 0;
  }
</style>
