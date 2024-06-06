<template>
  <RouterLink custom :to="item.path" v-slot="{ isActive, isExactActive, href, navigate }" v-for="(item, index) in props.data" :key="index">
    <template v-if="item.children">
      <div @click="toggle_children" :class="['item', { 'router-link-active': isActive }]">{{ $t(item.meta.title) }}<Icon name="arrow-down" size="2em" class="arrow"></Icon></div>
      <div class="sub">
        <SubMenu :data="item.children"></SubMenu>
      </div>
    </template>
    <a v-else :class="['item', { 'router-link-active': isActive }]" :href="href" @click="navigate">{{ $t(item.meta.title) }}</a>
  </RouterLink>
</template>

<script setup>
import { onMounted } from 'vue'
const props = defineProps(['data', 'active_name'])

function toggle_children(ev) {
  console.log(ev.currentTarget.nextElementSibling.style)
  const dom = ev.currentTarget.nextElementSibling
  if (dom.style.display === '') {
    dom.style.display = 'block'
    ev.currentTarget.classList.add('expand')
  } else {
    dom.style.display = ''
    ev.currentTarget.classList.remove('expand')
  }
}

onMounted(() => {
  //默认展开当前路由的子菜单
  const dom = document.getElementsByClassName('router-link-active')
  // console.log(dom)
  if (dom && dom[0]) {
    dom[0].style.display = 'flex'
    // dom[0].classList.add('expand')
    dom[0].previousElementSibling.classList.add('expand')
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
  color: var(--color-text);
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

.expand .arrow {
  transform: rotate(180deg);
  transition:
    cubic-bezier(0.645, 0.045, 0.355, 1),
    transform 0.15s;
}

.router-link-active {
  font-weight: 600;
  color: var(--color-text-active);
}
</style>
