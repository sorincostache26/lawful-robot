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
console.log("-------------------");
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

main()