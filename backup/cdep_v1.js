const {By,Key,Builder,until} = require("selenium-webdriver");
// const importable = require('../helpers/helper.js')
const fs = require('fs');
require("geckodriver");
const firefox = require('selenium-webdriver/firefox');

async function main(){

let firefoxOptions = new firefox.Options();
firefoxOptions.setPreference("browser.download.folderList",2);
firefoxOptions.setPreference("pdfjs.disabled", true);
firefoxOptions.setPreference("browser.download.dir", "C:\\Automation\\bm\\downloads");
let driver = new Builder()
.forBrowser('firefox')
.setFirefoxOptions(firefoxOptions)
.build();

var data = fs.readFileSync('./helpers/jsonTemplate.json');
var jsonObj = [] ;
jsonObj.push(JSON.parse(data));

//selectors fragile
var url = "http://cdep.ro/pls/caseta/ecaseta2015.OrdineZi?oid=2405";
var folderIcon = "[name='img3']";
var plNumberText = "a[href*='uph_pck2015.proiect?idp=1044']";
var iFrameId = '#frame3';
var pdfIcon = "a[href*='/pls/proiecte/docs/2022/ph081_solmjus.pdf']";
//selectors stable
var pageLogo = "[alt='Camera Deputatilor']";
var dismissCookies = '[aria-label="dismiss cookie message"]';

await driver.get(url);
await driver.findElement(By.css(dismissCookies)).click();
await driver.get(url);
await driver.sleep(1000);
await driver.findElement(By.css(pageLogo));

getAllElements(driver);
console.log('pana aici ati platit -------------------------');

let lawFolder = await driver.findElement(By.css(folderIcon));
await driver.wait(until.elementIsVisible(lawFolder),1000);
await lawFolder.click();

let plNumberHolder = await driver.findElement(By.css(plNumberText));
await driver.wait(until.elementIsVisible(plNumberHolder),1000);
driver.executeScript("window.scrollBy(0, 450)", "");
console.log('plNumber is: ', await plNumberHolder.getText());

jsonObj[0].cdep[0].lawProject.name = await plNumberHolder.getText() ;

await driver.switchTo().frame(driver.findElement(By.css(iFrameId)));
let pdfToDownload = await driver.findElement(By.css(pdfIcon));
console.log('pdfToDownload is: ', await pdfToDownload.getAttribute('href'));

jsonObj[0].cdep[0].lawProject.data[0].link = await pdfToDownload.getAttribute('href');
jsonObj[0].cdep[0].lawProject.data.push({"link": "another link added"});
jsonObj[0].cdep[0].lawProject.data.push({"link": "and another one"});
await driver.wait(until.elementIsVisible(pdfToDownload),1000);
await pdfToDownload.click();
await driver.sleep(4000);

console.log(JSON.stringify(jsonObj,null,'\t'));

await driver.quit();

}

async function getAllElements(driver){
var allRows = "table tr[id*='row']";
var allFolders = 'table [title="Vezi documentele asociate"]';
var allTableRowsWithoutId = ".grup-parlamentar-list table tbody tr:not([id])";
var allLaws = 'table tr:not([id]) a[target="PROIECT"]';
var allFolders = 'table tr:not([id]) a[title]';
//One is a PDF directly. I assume this happens when there is only one PDF per law.
var allPDFs = 'table tr:not([id]) a[target="PDF"]';

await driver.findElements(By.css('table tr:not([id]) a[target="PROIECT"]')).then((elements) => {
    elements.forEach((element) => {
        element.getText().then((text) => {
            console.log(text);
        });
    });
});
}

main()