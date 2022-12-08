const {By,Key,Builder,until} = require("selenium-webdriver");
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

for( element of (await getAllElements(driver))){
console.log("for element " + element + ": ");
let lawFolder = await driver.findElement(By.css("[name='"+element+"']"));
await driver.wait(until.elementIsVisible(lawFolder),1000);
await lawFolder.click();

console.log("the frame ID = " + returnIFrameId(element));
var isHotarare = (returnIFrameId(element)=="#frame3")||(returnIFrameId(element)=="#frame36");
console.log("este hotarare? " + isHotarare);

await driver.switchTo().frame(driver.findElement(By.css(returnIFrameId(element))));

if(isHotarare){
  await driver.wait(until.elementsLocated(By.css("body[bgcolor] >p b")),1500);
  let lawName= await driver.findElement(By.css("body[bgcolor] >p b"));
  console.log(await lawName.getText());
} else{
  await driver.wait(until.elementsLocated(By.css('tbody table tbody >tr td b')),1500);
  let lawName= await driver.findElement(By.css('tbody table tbody >tr td b'));
  console.log(await lawName.getText());
}

await driver.wait(until.elementsLocated(By.css("body tbody a[href]")),1500);
let pdfsToDownload = getAllPdfs(driver);
console.log(await pdfsToDownload);

console.log("-------------------");
await driver.switchTo().defaultContent();
}

await driver.quit();

}

function returnIFrameId(folderName){
    var pre = "img";
    var cut = folderName.split(pre)[1];
        return "#frame" + cut;
}

function getAllElements(driver){

  return driver.findElements(By.css("[name*='img']")).then(function(elements){
      var allPromises = elements.map(function(element){
          return element.getAttribute('name');
      });
      return Promise.all(allPromises);
  });     
}

function getAllPdfs(driver){
  return driver.findElements(By.css("body tbody a[href]")).then(function(pdfs){
      var allPromises = pdfs.map(function(pdf){
          return pdf.getAttribute('href');
      });
      return Promise.all(allPromises);
  });     
}

main()