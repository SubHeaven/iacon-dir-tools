const iaconDir = require('./index');

(async() => {
    // let result = await iaconDir.listDir('D:\\arquivos\\81\\05-2021');
    let result = await iaconDir.listDir('C:\\iacon\\teste');
    console.log("Oioioi");
    console.log(result)
})();