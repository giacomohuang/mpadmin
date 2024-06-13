<template>
  <RouterLink custom :to="item.path" v-slot="{ isActive, href, navigate }" v-for="(item, index) in props.data" :key="index">
    <template v-if="item.children">
      <div @click="toggle_children" class="item dir" :class="{ 'sub-active': isActive }">{{ $t(item.meta.title) }}<Icon name="arrow-down" size="2em" class="arrow"></Icon></div>
      <div class="sub">
        <SubMenu :data="item.children"></SubMenu>
      </div>
    </template>
    <a v-else :class="['item', { 'sub-active': isActive }]" :href="href" @click="navigate">{{ $t(item.meta.title) }}</a>
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
.item {
  font-size: 14px;
  display: flex;
  width: 140px;
  height: 35px;
  padding: 0 0 0 12px;
  align-items: center;
  margin: 0;
  color: var(--text-primary);
  &:hover,
  &:active {
    background: var(--bg-component-active);
  }
  cursor: pointer;
}

.sub {
  display: none;
  .item {
    padding-left: 24px;
  }
}

.children {
  display: none;
}

.arrow {
  transition:
    cubic-bezier(0.645, 0.045, 0.355, 1),
    transform 0.15s;
}

.expand {
  transform: rotate(180deg);
  transition:
    cubic-bezier(0.645, 0.045, 0.355, 1),
    transform 0.15s;
}

.sub-active {
  font-weight: 600;
  color: var(--text-primary-active);
}
</style>
