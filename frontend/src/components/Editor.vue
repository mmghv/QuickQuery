<script setup>
import { onMounted, onUpdated, ref, watch } from 'vue';
import { basicSetup, EditorView } from "codemirror"
import { EditorState } from "@codemirror/state"
import { sql, MSSQL } from "@codemirror/lang-sql"

const props = defineProps(['modelValue'])
const emit = defineEmits(['update:modelValue'])

const editor = new EditorView({
  state: EditorState.create({
    doc: props.modelValue,
    extensions: [
      basicSetup,
      sql({
        dialect: MSSQL,
        upperCaseKeywords: true,
      }),
      EditorView.updateListener.of(v => {
        if (v.docChanged) {
          emit('update:modelValue', v.state.doc.toString())
        }
      })
    ],
  }),
})

const utils = {
  getDoc() {
    return editor.state.doc.toString()
  },
  setDoc(doc) {
    if (this.getDoc() != doc) {
      editor.dispatch({
        changes: {
          from: 0,
          to: editor.state.doc.length,
          insert: doc
        }
      })
    }
  }
}

watch(() => props.modelValue, (val) => {
  utils.setDoc(val)
})

const container = ref()

function attachEditor() {
  if (editor.dom.parentElement !== container.value) {
    container.value.appendChild(editor.dom)
  }
}

onMounted(attachEditor)
onUpdated(attachEditor)
</script>

<template>
  <div ref="container"></div>
</template>

<style>
  .cm-editor {
    font-size: 1.2em;
    min-height: 4em;
    background-color: white;
    border: solid 1px #888;
    border-radius: 4px;
    padding: 2px;
  }
  .cm-scroller {
    overflow: auto;
  }
</style>
