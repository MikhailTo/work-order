<template>
	<a-select ref="select" v-model:value="value" style="width: 120px" :options="options" @focus="focus" @change="handleChange">
	</a-select>
</template>
<script>
	import {
		defineComponent,
		ref
	} from 'vue';
	export default defineComponent({
		setup() {
			const options = ref([{
				value: 'jack',
				label: 'Jack',
			}, {
				value: 'lucy',
				label: 'Lucy',
			}, {
				value: 'yiminghe',
				label: 'Yiminghe',
			}]);

			const handleChange = value => {
				console.log(`selected ${value}`);
			};
			const handleFocus = () => {
				console.log('focus');
			};
			return {
				value: ref(undefined),
				options,
				handleFocus,
				handleChange
			};
		},
	});
</script>