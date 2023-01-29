const {By,Key,Builder,until, WebElement} = require("selenium-webdriver");
const fs = require('fs');
require("geckodriver");
const firefox = require('selenium-webdriver/firefox');

async function main() {  
//selectors
const url = "https://www.mt.ro/web14/transparenta-decizionala/consultare-publica/acte-normative-in-avizare";
const cookies = '.accept.blue';
const pageLoaded = '.counter.pull-right';
const titlesRows = 'tr[class*=cat-list]';
const document = ".item-page > ul a";

let driver = DriverBuilder();

let senatJson = 
{
  "ministerul transporturilor":{}
};
var jsonObj = [] ;
var jsonTemplate = fs.readFileSync('./helpers/jsonTemplate.json');
var pdfTemplate = fs.readFileSync('./helpers/pdfTemplate.json');

await driver.get(url);
try {
	await driver.sleep(2000);
	await driver.findElement(By.css(cookies)).click();
} catch (NoSuchElementError) {
	
}
await driver.sleep(1000);
await driver.findElement(By.css(pageLoaded));

var originalWindow = await driver.getWindowHandle();
var newJson = JSON.parse(jsonTemplate);
newJson.lawProject.name = 'Projects';

for( row of (await getElementsList(driver, titlesRows))){
  newJson.lawProject.pdf.push(JSON.parse(pdfTemplate));

  await driver.wait(until.elementsLocated(By.css('td[headers="categorylist_header_title"] a')),2000);
  newJson.lawProject.pdf[newJson.lawProject.pdf.length -1].name = await row.findElement(By.css('td[headers="categorylist_header_title"] a')).getText();
  newJson.lawProject.pdf[newJson.lawProject.pdf.length -1].date = formatDate(await row.findElement(By.css('td[headers="categorylist_header_date"]')).getText());
  
  await row.findElement(By.css('td[headers="categorylist_header_title"] a')).sendKeys(Key.chord(Key.CONTROL, Key.ENTER));
  await driver.wait(async () => (await driver.getAllWindowHandles()).length === 2, 10000);
  
  const windows = await driver.getAllWindowHandles();
  windows.forEach(async handle => {
  if (handle !== originalWindow) {
    await driver.switchTo().window(handle);
  }
  });

  await driver.wait(until.elementsLocated(By.css(document)),2000);
  for( doc of (await getElementsList(driver, document))){
    if('textul complet al proiectului actului respectiv' == await doc.getText()){
      newJson.lawProject.pdf[newJson.lawProject.pdf.length -1].link = await doc.getAttribute('href');
    }
  }

  await driver.close(); 
  await driver.switchTo().window(originalWindow);
}

jsonObj.push(await Promise.resolve(newJson));
senatJson["ministerul transporturilor"] = jsonObj;
console.log(JSON.stringify(senatJson,null,'\t'));

if (!fs.existsSync('../downloads/')){
  fs.mkdirSync('../downloads/');
}
fs.writeFile('../downloads/ministerul_transporturilor.txt', JSON.stringify(senatJson,null,'\t'), err => {
  if (err) console.error(err);
});

await driver.quit();
}

function DriverBuilder() {
  let firefoxOptions = new firefox.Options();
  firefoxOptions.setPreference("browser.download.folderList", 2);
  firefoxOptions.setPreference("pdfjs.disabled", true);
  firefoxOptions.setPreference("browser.download.dir", "../downloads");
  let driver = new Builder()
    .forBrowser('firefox')
    .setFirefoxOptions(firefoxOptions)
    .build();
  return driver;
}

function getElementsList(driver, titlesRows){
  return driver.findElements(By.css(titlesRows)).then(function(title){
      var allPromises = title.map(function(title){
          return title;
      });
      return Promise.all(allPromises);
  });     
}

function formatDate(date) {
  if (!date || date == 'undefined') {
    return date;
  }

  let dateArray = date.split(" ");
  let day = dateArray[0];
  let month = dateArray[1];
  let year = dateArray[2];
  
  let months = ["Ianuarie", "Februarie", "Martie", "Aprilie", "Mai", "Iunie", "Iulie", "August", "Septembrie", "Octombrie", "Noiembrie", "Decembrie"];
  let monthNumber = months.indexOf(month) + 1;
  let monthString = monthNumber.toString().padStart(2, '0');
  
  return `${day}-${monthString}-${year}`;
}

main()