const {By,Key,Builder,until, WebElement} = require("selenium-webdriver");
const fs = require('fs');
require("geckodriver");
const firefox = require('selenium-webdriver/firefox');
const { isNull } = require("util");

async function main() {  
   //selectors
  var url = "https://sgg.gov.ro/1/anunturi-proiecte-de-acte-normative/";
  var pageLoaded = '#footer-col1 .footer-widget-title';
  var panel = '.panel-body .pt-cv-content *';
  var yearPanel = '.panel-title';
let driver = DriverBuilder();

//JSON init
let secretariatJson = 
{
  "sgg.gov":{}
};
var jsonObj = [] ;
var jsonTemplate = fs.readFileSync('./helpers/jsonTemplate.json');
var pdfTemplate = fs.readFileSync('./helpers/pdfTemplate.json');

//Load Page
await driver.get(url);
await driver.findElement(By.css(pageLoaded));
var currentYear = (await driver.findElement(By.css(yearPanel)).getText());
currentYear = currentYear.slice(-4,currentYear.length);
console.log('current year is -->'+ currentYear+'<--')

var oneTrueJson = JSON.parse(jsonTemplate);
oneTrueJson.lawProject.name = 'all of them' ;

for( row of (await getAllElements(driver, panel))){
  try{
      await row.findElement(By.css(' p>strong'));
  }
  catch{
    try{
      await row.findElement(By.css(' ul li'));
      var notNota = ':not([href*="nota"]):not([href*="Nota"]):not([href*="NOTA"]):not([href*="NF"])';
      var notAnunt = ':not([href*="ANUNT"]):not([href*="Anunt"]):not([href*="anunt"])';
      var notExtra = ':not([href*="motive"]):not([href*="MOTIVE"]):not([href*="Anexa"])';
      var notSkipped = ':not([href*="Registru"])';
      var temp = await (await row.findElement(By.css('ul a[href*=".pdf"]' + notNota + notAnunt + notExtra))).getAttribute('href');
      oneTrueJson.lawProject.pdf[oneTrueJson.lawProject.pdf.length - 1].link = temp;
      continue;
    }
    catch{
  continue;
    }
  };

  try {
    await row.findElement(By.css('a[href*=".pdf"]'));
    await row.findElement(By.css('a[href*=".doc"]'));

    var currentTitle =await buildTitle(row);
    if(currentTitle !== ''){
      console.log(currentTitle);
      await oneTrueJson.lawProject.pdf.push(JSON.parse(pdfTemplate));  
      oneTrueJson.lawProject.pdf[oneTrueJson.lawProject.pdf.length - 1].name = getNameFromTitle(currentTitle, currentYear);
      oneTrueJson.lawProject.pdf[oneTrueJson.lawProject.pdf.length - 1].date = getDatefromTitle(currentTitle,currentYear);
    }  
  }catch{
  }
}

jsonObj.push(await Promise.resolve(oneTrueJson));
secretariatJson["sgg.gov"] = jsonObj;
console.log(JSON.stringify(secretariatJson,null,'\t'));

//write file
if (!fs.existsSync('../downloads/')){
  fs.mkdirSync('../downloads/');
}
fs.writeFile('../downloads/sgg.gov.txt', JSON.stringify(secretariatJson,null,'\t'), err => {
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

function getAllElements(driver, container){
  return driver.findElements(By.css(container)).then(function(element){
      var allPromises = element.map(function(element){
          return element;
      });
      return Promise.all(allPromises);
  });     
}

async function buildTitle(row){
  var titleString = '';
  titleString += await row.getText();
  return titleString;
}

function getDatefromTitle(rawTitle, currentYear){
  var pre = "." + currentYear;
  return rawTitle.split(pre)[0] + pre;
}

function getNameFromTitle(rawTitle, currentYear){
  var pre = "." + currentYear;
  var extractedString = (rawTitle.split(pre)[1]);
  extractedString = extractedString.replaceAll('(.pdf)','').replaceAll('(.pdf )','').replaceAll('(pdf)','');
  extractedString = extractedString.replaceAll('(.doc /.pdf)','').replaceAll('(.pdf/ .doc)','').replaceAll('(.pdf / .docx)','');
  extractedString = extractedString.replaceAll('(doc)','').replaceAll('(.docx)','').replaceAll('(.docx )','').replaceAll('(.doc)','').replaceAll('(docx)','');
  extractedString = extractedString.trim();

  return extractedString;
}

main()