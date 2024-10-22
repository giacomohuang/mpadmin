<template>
  <RouterLink custom :to="item.path" v-slot="{ isActive, href, navigate }" v-for="(item, index) in props.data" :key="index">
    <template v-if="item.children">
      <div @click="toggle_children" class="submenu-item submenu-parent" :class="{ 'sub-active': isActive }"><span class="arrow"></span> {{ $t(item.meta.title) }}</div>
      <div class="submenu-children">
        <SubMenu :data="item.children"></SubMenu>
      </div>
    </template>
    <a v-else :class="['submenu-item', { 'sub-active': isActive }]" :href="href" @click="navigate"> <span class="dot"></span>{{ $t(item.meta.title) }} </a>
  </RouterLink>
</template>

<script setup>
import { onMounted } from 'vue'
const props = defineProps(['data'])

function toggle_children(ev) {
  const dom = ev.currentTarget.nextElementSibling
  if (dom.style.display === '') {
    dom.style.display = 'block'
    ev.currentTarget.children[0].classList.add('expand')
  } else {
    dom.style.display = ''
    ev.currentTarget.children[0].classList.remove('expand')
  }
}

onMounted(() => {
  //默认展开当前路由的子菜单
  const dom = document.querySelector('.dir.sub-active')
  if (dom) {
    dom.style.display = 'flex'
    dom.children[0].classList.add('expand')
    dom.nextElementSibling.style.display = 'block'
  }
})
</script>

<style scoped lang="scss">
.submenu-item {
  display: flex;
  align-items: center;
  width: 180px;
  height: 36px;
  padding-left: 12px;
  margin: 0;
  color: var(--text-primary);
  cursor: pointer;

  .dot {
    display: inline-block;
    width: 10px;
    height: 10px;
    margin-right: 10px;
    display: flex;
    align-items: center;
    justify-content: center;

    &::before {
      content: '';
      position: relative;
      display: block;
      width: 5px;
      height: 5px;
      border-radius: 50%;
      background: var(--bg-tertiary);
      transition: all 0.1s ease;
      // margin-right: 10px;
    }
  }

  &:hover,
  &:active {
    // font-weight: 600;
    .dot::before {
      width: 10px;
      height: 10px;
      background: var(--c-brand-400);
    }
  }

  @keyframes breathing {
    0% {
      transform: scale(1);
    }
    50% {
      transform: scale(5);
      opacity: 0.2;
    }
    100% {
      transform: scale(5);
      opacity: 0;
    }
  }
}

.submenu-children {
  display: none;

  .submenu-item {
    padding-left: 24px;
  }
}

.arrow {
  transition: transform 0.15s cubic-bezier(0.645, 0.045, 0.355, 1);
  width: 18px;
  height: 20px;
  display: flex;
  position: relative;
  align-items: center;
  justify-content: center;
  left: -4px;
  &.expand {
    transform: rotate(90deg);
  }
  &:before {
    content: '';
    position: absolute;
    display: block;
    width: 6px;
    height: 6px;
    // left: -5px;
    border-top: 2px solid var(--border-tertiary);
    border-right: 2px solid var(--border-tertiary);
    transform: rotate(45deg);
  }
}

.sub-active {
  font-weight: 600;
  color: var(--text-primary);
  .dot::before {
    width: 10px;
    height: 10px;
    background: var(--c-brand-400);
  }
}
</style>
