<template>
  <div class="main">
    <header class="header">审批流程编辑器</header>
    <div class="editor">
      <div class="bg">
        <div class="scrollbar">
          <div id="dragger">
            <div id="canvas">
              <div id="scaler">
                <div id="root">
                  <div id="nodes">sdfghksdjfklgsdfdfg</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.main {
  position: relative;
  // overflow: hidden;
}

.header {
  position: relative;
  z-index: 100;
  height: 64px;
  width: 100%;
  background: #fff;
  display: flex;
  border-bottom: 1px solid #e3e3e3;
  flex-direction: row;
  align-items: center;
}

.editor {
  overflow: auto;
  display: block;
  background: #fff;
}

#scaler {
  transform: scale(1);
  transform-origin: center top;
  flex-shrink: 0;
  flex-grow: 0;
  height: fit-content;
  width: fit-content;
  user-select: none;
  display: block;
  margin: 0;
  padding: 0;
}

.bg {
  position: fixed;
  left: 0;
  top: 64px;
  right: 0;
  bottom: 0;
  background: #f0f0f2;
}

.scrollbar {
  position: relative;
  height: 100%;
  overflow: hidden !important;
  overflow-anchor: none;
  touch-action: auto;
}

#dragger {
  cursor: grab;
  height: 100%;
  position: relative;
  overflow: scroll;
}

#root {
  margin: 0 auto;
  padding: 0;
  position: relative;
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  min-height: 100%;
}
</style>
