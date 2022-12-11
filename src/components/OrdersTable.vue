<template>
	<a-button class="editable-add-btn" @click="handleAdd">
		<plus-outlined class="editable-add-btn-icon" />
	</a-button>
	<a-upload v-model:file-list="fileList" name="file" :multiple="false" action="https://www.mocky.io/v2/5cc8019d300000980a055e76" :headers="headers" @change="handleChange">
		<a-button>
			Шаблон
		</a-button>
	</a-upload>
	<a-table bordered :data-source="dataSource" :columns="columns" :scroll="{ x: 1500, y: 500 }">
		<template #bodyCell="{ column, text, record }">
								<template v-if="editableColumns.includes(column.dataIndex)">
									<div>
										<span v-if="(editableData[record.key] && column.type === 'textarea')">
											<a-textarea 
												v-model:value="editableData[record.key][column.dataIndex]"
												:auto-size="{ minRows: 1, maxRows: 3 }"
											/>
										</span>
										<span v-else-if="(editableData[record.key] && column.type === 'select')">
											<a-select
												v-model:value="editableData[record.key][column.dataIndex]"
												:options="employees"
												style="width: 180px"
												:size="Small"
											/>
										</span>
										<span v-else-if="(editableData[record.key] && column.type === 'multi-select')">
											<a-select
												v-model:value="editableData[record.key][column.dataIndex]"
												mode="multiple"
												style="width: 180px"
												:size="Small"
												placeholder="Select Item..."
												max-tag-count="responsive"
												:options="employees"
											/>
										</span>
										<span v-else-if="(editableData[record.key] && column.type === 'date-picker')">
											<a-date-picker
												:show-time="{ format: 'HH:mm' }" format="DD-MM-YYYY HH:mm" 
												placeholder="Время выдачи" @change="onChange" @ok="onOk"
											/>
										</span>
										<span v-else-if="(editableData[record.key] && column.type === 'range-picker')">
											<a-range-picker
												:show-time="{ format: 'HH:mm' }" format="DD-MM-YYYY HH:mm"
												:placeholder="['Начало работы', 'Окончание работы']"
												@change="onRangeChange" @ok="onRangeOk"
											/>
										</span>
										<template v-else >
											{{ text }}
</template>

				</div>
			</template>
<template v-else-if="column.dataIndex === 'actions'">
	<div class="editable-row-operations">
		<span v-if="editableData[record.key]">
											<a-button @click="onSave(record.key)">
												<save-outlined class="editable-add-btn-icon"/>
											</a-button>
											<a-popconfirm title="Отменить?" @confirm="onCancel(record.key)">
												<a-button>
													<close-outlined class="editable-add-btn-icon"/>
												</a-button>
											</a-popconfirm>
										</span>
		<span v-else>
											<a-button @click="onEdit(record.key)">
												<edit-outlined class="editable-add-btn-icon" />
											</a-button>
											<a-popconfirm
												v-if="dataSource.length"
												title="Вы уверены, удалить?"
												@confirm="onDelete(record.key)"
											>
												<a-button class="editable-add-btn">
													<delete-outlined class="editable-add-btn-icon"/>
												</a-button>
											</a-popconfirm>
												<a-button @click="renderDoc('', dataSource[record.key], templateOutputFileName)" class="editable-add-btn">
													<download-outlined class="editable-add-btn-icon"/>
												</a-button>
										</span>
	</div>
</template>
		</template>
	</a-table>
	{{ JSON.stringify(dataSource, null, 2) }}
	{{ JSON.stringify(fileList, null, 2) }}
</template>

<script>
	import Docxtemplater from "docxtemplater"
	import PizZip from "pizzip"
	import PizZipUtils from "pizzip/utils/index.js"
	import {
		message
	} from 'ant-design-vue';
	import {
		saveAs
	} from "file-saver"
	import {
		computed,
		defineComponent,
		reactive,
		ref
	} from 'vue';
	import {
		SaveOutlined,
		CloseOutlined,
		EditOutlined,
		PlusOutlined,
		DeleteOutlined,
		DownloadOutlined
	} from '@ant-design/icons-vue';
	import {
		cloneDeep
	} from 'lodash-es';
	// import { renderDoc } from './GenerateDoc.vue'
	export default defineComponent({
		components: {
			SaveOutlined,
			CloseOutlined,
			EditOutlined,
			PlusOutlined,
			DeleteOutlined,
			DownloadOutlined
		},
		setup() {
			const editableColumns = [
				'extrad_date',
				'range_date',
				'issuer_name',
				'accountable_name',
				'allower_name',
				'producer_name',
				'watching_name',
				'brigade_members',
				'errand',
				'add_instrs'
			]
			const columns = [{
				title: 'Дата выдачи',
				width: 200,
				dataIndex: 'extrad_date',
				key: 'extrad_date',
				fixed: 'left',
				type: 'date-picker'
			}, {
				title: 'Период работы',
				width: 380,
				dataIndex: 'range_date',
				key: 'range_date',
				type: 'range-picker'
			}, {
				title: 'Выдающий наряд',
				dataIndex: 'issuer_name',
				key: 'issuer_name',
				width: 200,
				type: 'select'
			}, {
				title: 'Производитель',
				dataIndex: 'producer_name',
				key: 'producer_name',
				width: 200,
				type: 'select'
			}, {
				title: 'Члены бригады',
				dataIndex: 'brigade_members',
				key: 'brigade_members',
				width: 200,
				type: 'multi-select'
			}, {
				title: 'Допускающий',
				dataIndex: 'allower_name',
				key: 'allower_name',
				width: 200,
				type: 'select'
			}, {
				title: 'Ответственный',
				dataIndex: 'accountable_name',
				key: 'accountable_name',
				width: 200,
				type: 'select'
			}, {
				title: 'Наблюдающий',
				dataIndex: 'watching_name',
				key: 'watching_name',
				width: 200,
				type: 'select'
			}, {
				title: 'Поручения',
				dataIndex: 'errand',
				key: 'errand',
				width: 500,
				type: 'textarea'
			}, {
				title: 'Дополнительные указания',
				dataIndex: 'add_instrs',
				key: 'add_instrs',
				width: 500,
				type: 'textarea'
			}, {
				title: 'Действия',
				dataIndex: 'actions',
				key: 'operation',
				fixed: 'right',
				width: 100,
			}];
			const dataSource = ref([{
				key: '0',
				extrad_date: "31.07.2022 16:20",
				range_date: ["31.07.2022 16:30", "31.07.2022 19:20"],
				issuer_name: "Мягков В.Н. Vгр.",
				accountable_name: "Не назначается",
				allower_name: "Оперативный персонал",
				producer_name: "Шутов М.А. IV гр.",
				watching_name: "",
				brigade_members: ["Тошкин М.А. III гр."],
				errand: "В помещении ПТП стана 1700 диагностика, замена ячеек БФИ преобразователя 9КПУ проверка сопротивления перехода тиристоров.",
				add_instrs: "По заявке производителя работ для проверки импульсных тиристоров допускающему разрешается включать автомат QF63A 'С.Н. вентиляции 9КПУ'",
			}, {
				key: '1',
				extrad_date: "30.10.2022 11:40",
				range_date: ["30.10.2022 12:00", "30.10.2022 19:00"],
				issuer_name: "Мягков В.Н. Vгр.",
				accountable_name: "Не назначается",
				allower_name: "Оперативный персонал",
				producer_name: "Поляков А.Ю. IVгр.",
				watching_name: "",
				brigade_members: ["Тошкин М.А. III гр.", "Чижонков С.А.  IVгр."],
				errand: "В помещении ПТП стана 1700  ремонт секций  преобразователя 10 КПУ, проверка блинкеров предохранителей, сопротивления перехода тиристоров, проверка импульсов тиристоров. Замена индуктивного делителя тока.",
				add_instrs: "По заявке производителя работ для проверки импульсных тиристоров допускающему разрешается включать автомат 'С.Н. вентиляции 10КПУ'",
			}]);
			const count = computed(() => dataSource.value.length + 1);
			const editableData = reactive({});
			const employees = ref([" ", "не назначается", "Оперативный персонал", "Шутов М.А. IV гр.", "Тошкин М.А. III гр.",
				"Поляков А.Ю. IVгр.,", "Лестин С.. IVгр.,", "Крапивин В.. IVгр.,", "Мягков В.Н. Vгр."
			].map(
				(v) => ({
					label: v,
					value: v
				})
			));
			const onEdit = key => {
				editableData[key] = cloneDeep(dataSource.value.filter(item => key === item.key)[0]);
			};
			const onSave = key => {
				Object.assign(dataSource.value.filter(item => key === item.key)[0], editableData[key]);
				delete editableData[key];
			};
			const onCancel = key => {
				delete editableData[key];
			};
			const onDelete = key => {
				dataSource.value = dataSource.value.filter(item => item.key !== key);
			};
			const handleAdd = () => {
				const newData = {
					key: `${count.value}`,
					extrad_date: "",
					range_date: "",
					company_name: "",
					division_name: "",
					issuer_name: "",
					accountable_name: "",
					allower_name: "",
					producer_name: "",
					watching_name: "",
					brigade_members: "",
					errand: "",
					add_instrs: ""
				};
				dataSource.value.push(newData);
			};
			const handleChange = info => {
				if (info.file.status !== 'uploading') {
					console.log(info.file, info.fileList);
				}
				if (info.file.status === 'done') {
					message.success(`${info.file.name} file uploaded successfully`);
				} else if (info.file.status === 'error') {
					message.error(`${info.file.name} file upload failed.`);
				}
			};
			const onChange = (dateString) => {
				console.log('Formatted Selected Time: ', dateString);
			};
			const onRangeChange = (dateString) => {
				console.log('Formatted Selected Time: ', dateString);
			};
			const loadFile = (url, callback) => {
				PizZipUtils.getBinaryContent(url, callback)
			};
			const templateOutputFileName = "output.docx";
			const renderDoc = (pathFileTemplate, dataFileTemplate, nameFileOutput = "output.docx") => {
				loadFile(pathFileTemplate, (error, content) => {
					if (error) {
						throw error;
					}
					const zip = new PizZip(content)
					const doc = new Docxtemplater(zip, {
						paragraphLoop: true,
						linebreaks: true
					})
					doc.setData(dataFileTemplate)
					try {
						doc.render()
					} catch (error) {
						const replaceErrors = (key, value) => {
							if (value instanceof Error) {
								return Object.getOwnPropertyNames(value).reduce(
									(error, key) => {
										error[key] = value[key]
										return error
									}, {})
							}
							return value
						}
						console.log(JSON.stringify({
							error: error
						}, replaceErrors))
						if (error.properties && error.properties.errors instanceof Array) {
							const errorMessages = error.properties.errors
								.map((error) => {
									return error.properties.explanation
								})
								.join("\n")
							console.log("errorMessages", errorMessages)
						}
						throw error
					}
					const out = doc.getZip().generate({
						type: "blob",
						mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
					})
					saveAs(out, nameFileOutput)
				})
			};
			const fileList = ref([]);
			return {
				fileList,
				headers: {
					authorization: 'authorization-text',
				},
				templateOutputFileName,
				renderDoc,
				editableColumns,
				columns,
				handleChange,
				onChange,
				onRangeChange,
				onDelete,
				onEdit,
				onSave,
				onCancel,
				handleAdd,
				dataSource,
				employees,
				editableData,
				count
			};
		},
	});
</script>
<style>
	.ant-btn {
		margin-bottom: 8px
	}
	.editable-cell {
		position: relative;
	}
	.editable-cell-input-wrapper,
	.editable-cell-text-wrapper {
		padding-right: 24px;
	}
	.editable-cell-text-wrapper {
		padding: 5px 24px 5px 5px;
	}
	.editable-cell-icon,
	.editable-cell-icon-check {
		position: absolute;
		right: 0;
		width: 20px;
		cursor: pointer;
	}
	.editable-cell-icon {
		margin-top: 4px;
		display: none;
	}
	.editable-cell-icon-check {
		line-height: 28px;
	}
	.editable-cell-icon:hover,
	.editable-cell-icon-check:hover {
		color: #108ee9;
	}
	.editable-add-btn {
		margin-bottom: 8px;
	}
	.editable-add-btn-icon {
		height: auto;
		display: block;
		margin: 0 auto;
	}
	.editable-cell:hover .editable-cell-icon {
		display: inline-block;
	}
</style>