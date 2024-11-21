<template>
  <div>
    <bubble-menu :editor="editor" :tippy-options="{ duration: 100 }" v-if="editor" class="toolbar">
      <button @click="editor.chain().focus().toggleBold().run()" :class="{ active: editor.isActive('bold') }">粗体</button>
      <button @click="editor.chain().focus().toggleItalic().run()" :class="{ active: editor.isActive('italic') }">斜体</button>
      <button @click="editor.chain().focus().toggleUnderline().run()" :class="{ active: editor.isActive('underline') }">下划线</button>
      <button @click="editor.chain().focus().toggleStrike().run()" :class="{ active: editor.isActive('strike') }">删除线</button>
      <button @click="editor.chain().focus().setTextAlign('left').run()" :class="{ active: editor.isActive({ textAlign: 'left' }) }">左对齐</button>
      <button @click="editor.chain().focus().setTextAlign('center').run()" :class="{ active: editor.isActive({ textAlign: 'center' }) }">居中</button>
      <button @click="editor.chain().focus().setTextAlign('right').run()" :class="{ active: editor.isActive({ textAlign: 'right' }) }">右对齐</button>
    </bubble-menu>
    <editor-content :editor="editor" class="editor" />
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { BubbleMenu, Editor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
const props = defineProps(['modelValue', 'autofocus'])
const emits = defineEmits(['update:modelValue'])
const editor = ref(null)

watch(
  () => props.modelValue,
  (value) => {
    const isSame = editor.value.getHTML() === value
    if (isSame) {
      return
    }
    editor.value.commands.setContent(value, false)
  }
)

onMounted(() => {
  editor.value = new Editor({
    content: props.modelValue,
    autofocus: props.autofocus || false,
    extensions: [StarterKit.configure({ dropcursor: false, hardBreak: false }), Underline, TextAlign.configure({ types: ['heading', 'paragraph'] })],
    onUpdate: () => {
      emits('update:modelValue', editor.value.getHTML())
    }
    // autofocus: false
  })
  // editor.value.setEditable(false);
})
</script>
<style scoped lang="scss">
.toolbar {
  border: 1px solid #e3e3e3;
  border-radius: 4px;
  background: #fff;
  padding: 2px;
  box-shadow: 0px 4px 16px rgb(0 0 0 / 8%);
  display: flex;
  list-style-type: none;
}
button {
  background: #fff;
  border: 0px;
  padding: 0px;

  &.active .icon {
    color: #2d8ac7;
    opacity: 1;
  }

  &:hover,
  &:active {
    cursor: pointer;
    .icon {
      opacity: 1;
    }
  }
}

.icon {
  color: #000;
  font-size: 20px;
  opacity: 0.5;
}
</style>
<style lang="scss">
// .ProseMirror {
// word-break: break-all;
// word-wrap: break-word;
// border: 1px dashed #ffffff00;
// border-radius: 4px;
// &:hover {
//   border: 1px dashed #68cef8;
// }
// }
// .ProseMirror-focused {
//   &:hover {
//     border: 1px solid #68cef8;
//   }
//   width: 100%;
//   height: 100%;
//   left: 0;
//   top: 0;
//   z-index: 0;
//   border-radius: 4px;
//   border: 1px solid #68cef8;
// }

/* Basic editor styles */
.ProseMirror {
  p {
    line-height: 100%;
  }
}
//   > * + * {
//     margin-top: 0.75em;
//   }
//   ul,
//   ol {
//     padding: 0 1rem;
//   }
//   h1,
//   h2,
//   h3,
//   h4,
//   h5,
//   h6 {
//     line-height: 1.1;
//   }
//   code {
//     background-color: rgba(#616161, 0.1);
//     color: #616161;
//   }
//   pre {
//     background: #0d0d0d;
//     color: #fff;
//     font-family: 'JetBrainsMono', monospace;
//     padding: 0.75rem 1rem;
//     border-radius: 0.5rem;
//     code {
//       color: inherit;
//       padding: 0;
//       background: none;
//       font-size: 0.8rem;
//     }
//   }
//   img {
//     max-width: 100%;
//     height: auto;
//   }
//   blockquote {
//     padding-left: 1rem;
//     border-left: 2px solid rgba(#0d0d0d, 0.1);
//   }
//   hr {
//     border: none;
//     border-top: 2px solid rgba(#0d0d0d, 0.1);
//     margin: 2rem 0;
//   }
// }
</style>
