const {By,Key,Builder,until} = require("selenium-webdriver");
const fs = require('fs');
require("geckodriver");
const firefox = require('selenium-webdriver/firefox');

async function main(){

//driver
let firefoxOptions = new firefox.Options();
firefoxOptions.setPreference("browser.download.folderList",2);
firefoxOptions.setPreference("pdfjs.disabled", true);
firefoxOptions.setPreference("browser.download.dir", "C:\\Automation\\bm\\downloads");
let driver = new Builder()
.forBrowser('firefox')
.setFirefoxOptions(firefoxOptions)
.build();

//selectors fragile
var url = "http://cdep.ro/pls/caseta/ecaseta2015.OrdineZi?oid=2405";
var folderIcon = "[name='img3']";
var plNumberText = "a[href*='uph_pck2015.proiect?idp=1044']";
var iFrameId = '#frame3';
var pdfIcon = "a[href*='/pls/proiecte/docs/2022/ph081_solmjus.pdf']";
//selectors stable
var pageLogo = "[alt='Camera Deputatilor']";
var dismissCookies = '[aria-label="dismiss cookie message"]';
var allFolders = 'table [title="Vezi documentele asociate"]';

var data = fs.readFileSync('./helpers/jsonTemplate.json');
var jsonObj = [] ;
jsonObj.push(JSON.parse(data));

//open and load page.
await driver.get(url);
await driver.findElement(By.css(dismissCookies)).click();
await driver.get(url);
await driver.sleep(1000);
await driver.findElement(By.css(pageLogo));


// const rowNumber = [];
// var expandableFolders = await driver.findElements(By.css(allFolders));
// expandableFolders.forEach(async (x, i) => rowNumber.push(await returnRowNumber((x.getAttribute('href')).toString())));

// .then((folders) => {
//     const innerFolderNumber = [];
//     folders.forEach(async (folder) => {
//         console.log("inner for each+ " + returnRowNumber((await folder.getAttribute('href')).toString()));
//         innerFolderNumber.push(returnRowNumber((await folder.getAttribute('href')).toString()));
//     })
//     return innerFolderNumber;
// })

// for (let i=0;i<expandableFolders;i++){
//     console.log(expandableFolders[i++]);
// }

var folderNumber = "21";

let lawFolder = await driver.findElement(By.css("[name='img"+ folderNumber + "']"));
await driver.wait(until.elementIsVisible(lawFolder),1000);
await lawFolder.click();
await driver.switchTo().frame(driver.findElement(By.css("#frame" + folderNumber)));

let pdfToDownload = await driver.findElement(By.css("a[href*='/pls/proiecte/docs/']"));
let lawName= await driver.findElement(By.css("table table tbody >tr"));
await driver.wait(until.elementIsVisible(pdfToDownload),1000);
console.log(await pdfToDownload.getAttribute('href'));
console.log(await lawName.getText());

// await getAllElements(driver);

// await driver.quit();

}
function AsyncSection(){
(async () => {
    console.log(await getAllElements(driver))
  })()
}

function returnRowNumber(hrefString){
    var pre = "(";
    var post = ",";
    var cutfirst = hrefString.split(pre)[1];
    finalcut = cutfirst.split(post)[0];
        return finalcut;
}

async function getAllElements(driver){

var allRows = "table tr[id*='row']";
var allFolders = 'table [title="Vezi documentele asociate"]';
var allTableRowsWithoutId = ".grup-parlamentar-list table tbody tr:not([id])";
var allLaws = 'table tr:not([id]) a[target="PROIECT"]';
var allFolders = 'table tr:not([id]) a[title]';
//One is a PDF directly. I assume this happens when there is only one PDF per law.
var allPDFs = 'table tr:not([id]) a[target="PDF"]';

await driver.findElements(By.css(allFolders)).then((folders) => {
    folders.forEach(async (folder) => {
        console.log(await folder.getAttribute('href'));
        await driver.wait(until.elementIsVisible(folder),1000);
        await folder.click();
        // var iframeId = ;
        // console.log (await iframeId);
        await driver.switchTo().frame(driver.findElement(By.css(returnRowNumber((await folder.getAttribute('href')).toString()))));    
        let pdfToDownload = await driver.findElement(By.css("a[href*='/pls']"));
        await driver.wait(until.elementIsVisible(pdfToDownload),1000);
        await pdfToDownload.click(); 
        // console.log (await folder.findElement(By.css('a[target="PDF"]')).getAttribute('href').toString());
    });
});
};

async function backup(){
    
//option 1
// let allRows_new = await driver.findElements(By.css(allTableRowsWithoutId));
// let window = 2;
// allRows_new.forEach(async (row) => {
//     let lawElement = (await row.findElement(By.css("td:nth-child(2)"))).getText();
    
    
//     console.log("window is:" + window + "extra " + await lawElement);
//     window++;
//     await row.findElement(By.css("td:nth-child(4)")).then(async (lawFolderinn) =>{
//         await lawFolderinn.click();
//         await driver.switchTo().frame(window++);        
//         await driver.switchTo().defaultContent();
//     })

// });

//Option 2

// .findElement(By.css('a[target="PROIECT"]'))
// await (await driver.findElement(By.css('a[title]')))
var iframes = [];
await driver.findElements(By.css(allTableRowsWithoutId)).then((allRowsHere) => {
    allRowsHere.forEach(async (row) => {
        await row.findElements(By.css('a[title]')).then((elements) =>{
                                            elements.forEach(async (element) =>{
                                                    // iframes.push( await element.getAttribute('href'));
                                                    console.log(await element.getAttribute('href'));
                                                        });
        });
    });
});
//option 3
//         await driver.switchTo().defaultContent();
// .findElement(By.css('a[target="PROIECT"]'))
// await (await driver.findElement(By.css('a[title]')))
await driver.findElements(By.css(allFolders)).then((folders) => {
    folders.forEach(async (folder) => {
        await driver.wait(until.elementIsVisible(folder),1000);
        await folder.click();
        // var iframeId = ;
        // console.log (await iframeId);
        await driver.switchTo().frame(driver.findElement(By.css(returnRowNumber((await folder.getAttribute('href')).toString()))));    
        let pdfToDownload = await driver.findElement(By.css("a[href*='/pls']"));
        await driver.wait(until.elementIsVisible(pdfToDownload),1000);
        await pdfToDownload.click(); 
        // console.log (await folder.findElement(By.css('a[target="PDF"]')).getAttribute('href').toString());
    });
});
}




main()