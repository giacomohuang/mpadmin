<template>
  <RouterLink custom :to="item.router" v-slot="{ isActive, href, navigate }" v-for="(item, index) in props.data" :key="index">
    <template v-if="item.children.length > 0">
      <div @click.stop="toggle_children" class="wrapper">
        <div class="item"><span class="arrow"></span> {{ $t(item.name) }}</div>
        <div class="children">
          <SubMenu :data="item.children"></SubMenu>
        </div>
      </div>
    </template>
    <a v-else :class="['item', { active: isActive }]" :href="href" :target="item.target" @click.stop="navigate"> <span class="dot"></span>{{ $t(item.name) }} </a>
  </RouterLink>
</template>

<script setup>
import { onMounted, ref } from 'vue'
const props = defineProps(['data'])
// function toggle_children(ev) {
//   const dom = ev.currentTarget.nextElementSibling
//   if (dom.style.display === '') {
//     dom.style.display = 'block'
//     ev.currentTarget.children[0].classList.add('expand')
//   } else {
//     dom.style.display = ''
//     ev.currentTarget.children[0].classList.remove('expand')
//   }
// }

function toggle_children(ev) {
  const dom = ev.currentTarget
  dom.classList.toggle('expand')
}

onMounted(() => {
  //   //默认展开当前路由的子菜单
  const dom = document.querySelector('.submenu .active')
  console.log(dom)
  if (dom) {
    // dom.classList.add('expand')
    dom.parentElement.parentElement.classList.add('expand')
    // dom.nextElementSibling.style.display = 'flex'
  }
})
</script>

<style scoped lang="scss">
.wrapper {
  &.expand {
    display: block;
    .arrow {
      transform: rotate(90deg);
    }
    .children {
      display: block;
    }
  }
  // display: none;

  .children {
    display: none;
    padding-left: 20px;
  }
}

.item {
  display: flex;
  align-items: center;
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

  &:hover {
    font-weight: 600;
    .dot::before {
      width: 10px;
      height: 10px;
      background: var(--c-brand-400);
    }
  }
}

.arrow {
  transition: transform 0.15s cubic-bezier(0.645, 0.045, 0.355, 1);
  width: 20px;
  height: 20px;
  display: flex;
  position: relative;
  align-items: center;
  justify-content: center;
  left: -4px;

  &:before {
    content: '';
    position: absolute;
    display: block;
    width: 7px;
    height: 7px;
    // background: #444;

    border-color: var(--border-tertiary);
    border-width: 2px 2px 0 0;
    transform: translate(-2px, -1px) rotate(45deg);
  }
}

.active {
  font-weight: 600;
  color: var(--text-primary);
  .dot::before {
    width: 10px;
    height: 10px;
    background: var(--c-brand-400);
  }
}
</style>
