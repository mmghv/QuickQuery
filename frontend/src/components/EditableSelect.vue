<script setup>
import { reactive, watch } from 'vue';

const props = defineProps(['modelValue', 'items'])
const emit = defineEmits(['update:modelValue'])

const data = reactive({
  value: props.modelValue,
})

watch(() => props.modelValue, (newVal, _) => {
  data.value = newVal;
})

watch(() => data.value, (newVal, _) => {
  emit('update:modelValue', newVal)
})

</script>

<!-- ============================================================================= -->
<!-- ============================================================================= -->

<template>
  <div class="select-editable">
    <select @change="data.value = $event.target.value">
      <option v-for="item in props.items" :value="item">{{ item }}</option>
    </select>
    <input type="text" v-model="data.value" />
  </div>
</template>

<!-- ============================================================================= -->
<!-- ============================================================================= -->

<style scoped>
.select-editable {
  display: inline-block;
  position: relative;
  background-color: white;
  border: solid grey 1px;
  padding: 1px 2px;
}

.select-editable select {
  font-size: inherit;
  border: none;
  width: 100%;
  margin: 0;
}

.select-editable input {
  position: absolute;
  top: 0px;
  bottom: 0px;
  left: 5px;
  width: calc(100% - 22px);
  min-height: 0;
  padding: 0;
  border: none;
  font-size: inherit;
}

.select-editable select:focus,
.select-editable input:focus {
  outline: none;
}
</style>