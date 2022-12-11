const {By,Key,Builder,until, WebElement} = require("selenium-webdriver");
const fs = require('fs');
require("geckodriver");
const firefox = require('selenium-webdriver/firefox');

//TODO: hotarare. PDF direct-fara folder
//TODO: discuss about entry page. It gets updated, the one we have now in URL is old.
    //   https://www.cdep.ro/pls/caseta/ecaseta2015.OrdineZi?oid=2419 is the new one. 
    // to get the page from the site
//When should we run this? the site seems to update once every ordinea de zi. so running it every 5 minutes is retarded.
//TODO: date field trim the spaces

async function main() {  
 
//selectors
var url = "https://www.cdep.ro/pls/caseta/ecaseta2015.OrdineZi?oid=2419";
var pageLogo = "[alt='Camera Deputatilor']";
var dismissCookiesButton = '[aria-label="dismiss cookie message"]';
var decisionNameField = 'body[bgcolor] >p b';
var lawNameField = 'tbody table tbody >tr td b';
var pdfTable = 'table table tbody tr[align]';
var pdfDateRelative = 'td.headlinetext1';
var pdfNameRelative = 'td:nth-child(2)';
var pdfLinkRelative = 'td a[href]';

//driver
let firefoxOptions = new firefox.Options();
firefoxOptions.setPreference("browser.download.folderList",2);
firefoxOptions.setPreference("pdfjs.disabled", true);
firefoxOptions.setPreference("browser.download.dir", "C:\\Automation\\bm\\downloads");
let driver = new Builder()
.forBrowser('firefox')
.setFirefoxOptions(firefoxOptions)
.build();

//JSON
let cdepJson = 
{
  "cdep":{}
};
var jsonObj = [] ;
var jsonTemplate = fs.readFileSync('./helpers/jsonTemplate_v2.json');
var pdfTemplate = fs.readFileSync('./helpers/pdfTemplate.json');
  
//Load Page
await driver.get(url);
await driver.findElement(By.css(dismissCookiesButton)).click();
await driver.get(url);
await driver.sleep(1000);
await driver.findElement(By.css(pageLogo));

for( element of (await getAllElements(driver))){
  var newJson = JSON.parse(jsonTemplate);
  
  console.log("for element " + element + ": ");
  let lawFolder = await driver.findElement(By.css("[name='"+element+"']"));
  await driver.wait(until.elementIsVisible(lawFolder),1000);
  await lawFolder.click();
  
  console.log("the frame ID = " + returnIFrameId(element));
  await driver.switchTo().frame(driver.findElement(By.css(returnIFrameId(element))));

  let lawProjectNameSelector = lawNameField;
  try {
    await driver.wait(until.elementsLocated(By.css('body >table')),1500);
    console.log("este lege");
  } catch (error) {
    lawProjectNameSelector = decisionNameField;
    console.log("este hotarare");
    await driver.switchTo().defaultContent();
    continue; // FIXME
  }

  await driver.wait(until.elementsLocated(By.css(lawProjectNameSelector)),1500);
  let lawName= await driver.findElement(By.css(lawProjectNameSelector));
  newJson.lawProject.name = await lawName.getText() ;
  console.log(await newJson.lawProject.name);
  
  await driver.wait(until.elementsLocated(By.css(pdfTable)),3000);
  //clean
  let tabletable = await driver.findElements(By.css(pdfTable));
  console.log("Total number of elements -> " + tabletable.length + "");

  for(let row of await driver.findElements(By.css(pdfTable))){
    newJson.lawProject.pdf.push(JSON.parse(pdfTemplate));
    try {
      newJson.lawProject.pdf[newJson.lawProject.pdf.length -1].date = await row.findElement(By.css(pdfDateRelative)).getText();
    } catch (NoSuchElementError) {
      newJson.lawProject.pdf[newJson.lawProject.pdf.length -1].date = await Promise.resolve('undefined');
    }
    try {
      newJson.lawProject.pdf[newJson.lawProject.pdf.length -1].name  = await row.findElement(By.css(pdfNameRelative)).getText();
    } catch (NoSuchElementError) {
      newJson.lawProject.pdf[newJson.lawProject.pdf.length -1].name = await Promise.resolve('undefined');
    }        
    try {
      newJson.lawProject.pdf[newJson.lawProject.pdf.length -1].link = await row.findElement(By.css(pdfLinkRelative)).getAttribute('href');
    } catch (NoSuchElementError) {
      newJson.lawProject.pdf[newJson.lawProject.pdf.length -1].link = await Promise.resolve('undefined');
    }
    console.log(JSON.stringify(await newJson.lawProject.pdf[newJson.lawProject.pdf.length -1],null,'\t'));
  }
  
  jsonObj.push(await Promise.resolve(newJson));

  console.log("------------------->");
  await driver.switchTo().defaultContent();
}

cdepJson.cdep = jsonObj;
console.log(JSON.stringify(cdepJson,null,'\t'));

fs.writeFile('../downloads/cdep.txt', JSON.stringify(cdepJson,null,'\t'), err => {
  if (err) {
    console.error(err);
  }
});

await driver.quit();
}

function returnIFrameId(folderName){
    var pre = "img";
    var cut = folderName.split(pre)[1];
    return "#frame" + cut;
}

function getAllElements(driver){
var allFolders = "[name*='img']";
  return driver.findElements(By.css(allFolders)).then(function(elements){
      var allPromises = elements.map(function(element){
          return element.getAttribute('name');
      });
      return Promise.all(allPromises);
  });     
}

main()