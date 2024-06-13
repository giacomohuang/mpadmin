<template>
  <a-result status="404" title="404" :sub-title="$t('404.description')">
    <template #extra>
      <a href="/">{{ $t('404.backhome') }}</a>
    </template>
  </a-result>
</template>
<script setup></script>
