<script>
	import Docxtemplater from "docxtemplater"
	import PizZip from "pizzip"
	import PizZipUtils from "pizzip/utils/index.js"
	import { saveAs } from "file-saver"

export default {
	setup () {
		

		const loadFile = (url, callback) => {
			PizZipUtils.getBinaryContent(url, callback)
		}

		const renderDoc = (pathFileTemplate, dataFileTemplate, nameFileOutput = "output.docx") => {
			loadFile(pathFileTemplate, (error, content) => {
				if (error) { 
					throw error;
				}

				const zip = new PizZip(content)
				const doc = new Docxtemplater(zip, {paragraphLoop: true, linebreaks: true})
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
						console.log(JSON.stringify({error: error }, replaceErrors))
						
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
		}

		return {
			renderDoc
		}
	}
}
</script>