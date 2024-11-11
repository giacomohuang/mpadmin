import { h, render } from 'vue'
import i18n from '../js/i18n'

// 从环境变量获取支持的语言列表
const SUPPORTED_LANGUAGES = import.meta.env.VITE_LANGUAGES.split(',')
const { locale } = i18n.global

const createI18nEditor = (languages, currentValue, position, onSave) => {
  return h(
    'div',
    {
      class: 'i18n-editor',
      style: {
        position: 'absolute',
        top: position.top < 200 ? `${position.bottom + 5}px` : `${position.top - 250}px`,
        left: `${position.left + 10}px`,
        padding: '12px',
        background: 'var(--bg-primary)',
        border: '1px solid var(--border-light)',
        borderRadius: '8px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
        zIndex: 1000,
        width: '300px'
      }
    },
    [
      // 语言输入框列表
      ...languages.map((lang) =>
        h(
          'div',
          {
            class: 'mb-2'
          },
          [
            h(
              'div',
              {
                style: {
                  fontSize: '12px',
                  color: 'var(--text-secondary)',
                  margin: '12px 0 4px 0'
                }
              },
              lang
            ),
            h('input', {
              type: 'text',
              autocomplete: 'new-password',
              style: {
                width: '100%',
                border: '1px solid var(--border-light)',
                borderRadius: '4px',
                padding: '4px'
              },
              value: currentValue[lang] || '',
              onInput: (e) => {
                currentValue[lang] = e.target.value
              }
            })
          ]
        )
      ),
      // 保存按钮
      h(
        'div',
        {
          style: {
            display: 'flex',
            justifyContent: 'flex-end',
            marginTop: '8px'
          }
        },
        [
          h(
            'button',
            {
              style: {
                padding: '4px 8px',
                marginTop: '8px',
                background: 'var(--bg-brand)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-light)',
                borderRadius: '4px'
              },
              onClick: () => onSave(currentValue)
            },
            '保存'
          )
        ]
      )
    ]
  )
}

const vI18n = {
  mounted: (el, binding) => {
    // 存储当前的多语言值
    const currentValue = binding.value || {}
    console.log('hahahhha', binding.value)

    // 创建触发按钮
    const createTrigger = () => {
      const box = el.getBoundingClientRect()
      return h('div', {
        class: 'i18n-trigger',
        style: {
          position: 'absolute',
          top: `${box.top}px`,
          left: `${box.left + box.width - 20}px`,
          padding: '4px',
          cursor: 'pointer',
          background: 'var(--bg-primary)',
          border: '1px solid var(--border-light)',
          borderRadius: '4px',
          zIndex: 2000
        },
        innerHTML: locale.value,
        onClick: () => {
          // 移除已存在的编辑器
          const existingEditor = document.querySelector('.i18n-editor')
          if (existingEditor) {
            render(null, existingEditor)
            existingEditor.remove()
          }

          // 创建并渲染编辑器
          const editor = createI18nEditor(SUPPORTED_LANGUAGES, currentValue, box, (newValue) => {
            // 触发父组件的更新
            binding.instance.$emit('update:i18n', newValue)
            // 移除编辑器
            const editor = document.querySelector('.i18n-editor')
            if (editor) {
              render(null, editor)
              editor.remove()
            }
          })

          const container = document.createElement('div')
          document.body.appendChild(container)
          render(editor, container)
        }
      })
    }

    // 监听焦点事件
    el.addEventListener('focus', () => {
      const existingTrigger = document.querySelector('.i18n-trigger')
      if (existingTrigger) {
        render(null, existingTrigger)
        existingTrigger.remove()
      }

      const container = document.createElement('div')
      document.body.appendChild(container)
      render(createTrigger(), container)
    })

    // 监听失焦事件，但不立即移除触发器（让用户有机会点击）
    el.addEventListener('blur', () => {
      setTimeout(() => {
        const trigger = document.querySelector('.i18n-trigger')
        if (trigger && !document.querySelector('.i18n-editor')) {
          render(null, trigger)
          trigger.remove()
        }
      }, 200)
    })
  },

  unmounted: (el) => {
    // 清理所有相关元素
    const trigger = document.querySelector('.i18n-trigger')
    const editor = document.querySelector('.i18n-editor')

    if (trigger) {
      render(null, trigger)
      trigger.remove()
    }

    if (editor) {
      render(null, editor)
      editor.remove()
    }

    // 移除事件监听器
    el.removeEventListener('focus', () => {})
    el.removeEventListener('blur', () => {})
  }
}

export default {
  install: (app) => {
    app.directive('i18n', vI18n)
  }
}
