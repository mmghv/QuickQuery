<script setup lang="ts">
import { onMounted, onUpdated, ref, watch } from 'vue';
import { basicSetup } from "codemirror"
import { EditorView, keymap } from "@codemirror/view"
import { EditorState } from "@codemirror/state"
import { sql, MSSQL } from "@codemirror/lang-sql"
import { indentWithTab, redo } from "@codemirror/commands"

const props = defineProps(['modelValue'])
const emit = defineEmits(['update:modelValue'])

const editor = new EditorView({
  state: EditorState.create({
    doc: props.modelValue,
    extensions: [
      basicSetup,
      keymap.of([
        indentWithTab,
        {key: 'Ctrl-Shift-z', run: redo, preventDefault: true},
      ]),
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
  setDoc(doc: string) {
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
    editor.dom.querySelector<any>('.cm-scroller').style.height = '74px'
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
    background-color: white;
    border: solid 1px #888;
    border-radius: 4px;
    padding: 2px;
    padding-right: 0;
    transition: outline .2s;
    outline: 0px dotted transparent !important;
  }
  .cm-editor.cm-focused {
    outline: 1px dotted #219c83 !important;
  }
  .cm-scroller {
    resize: vertical;
    overflow: auto;
    min-height: 3.2em;
  }
</style>
