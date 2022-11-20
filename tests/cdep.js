const {By,Key,Builder,until} = require("selenium-webdriver");

require("geckodriver");
const firefox = require('selenium-webdriver/firefox');

async function cdepDownload(){

let firefoxOptions = new firefox.Options();
firefoxOptions.setPreference("browser.download.folderList",2);
firefoxOptions.setPreference("pdfjs.disabled", true);
firefoxOptions.setPreference("browser.download.dir", "C:\\Automation\\bm\\downloads");
let driver = new Builder()
.forBrowser('firefox')
.setFirefoxOptions(firefoxOptions)
.build();


       var url = "http://cdep.ro/pls/caseta/eCaseta2015.OrdineZi";

       //selectors
       var folderIcon = "[name='img4']";
       var pdfIcon = "a[href*='comisii/administratie'] [alt='PDF format']";
       var plNumberText = "a[href*='upl_pck2015.proiect?idp=20292']";
       var pageLogo = "[alt='Camera Deputatilor']";
       var dismissCookies = '[aria-label="dismiss cookie message"]';


        
        await driver.get(url);
        await driver.findElement(By.css(dismissCookies)).click();
        await driver.get(url);
        await driver.sleep(1000);
        await driver.findElement(By.css(pageLogo));
 
        let lawFolder = await driver.findElement(By.css(folderIcon));
        await driver.wait(until.elementIsVisible(lawFolder),1000);
        await lawFolder.click();

        let plNumberHolder = await driver.findElement(By.css(plNumberText));
        await driver.wait(until.elementIsVisible(plNumberHolder),1000);
        driver.executeScript("window.scrollBy(0, 350)", "");

        console.log('plNumber is: ', await plNumberHolder.getText());
        
        await driver.switchTo().frame(driver.findElement(By.css('#frame4')));
        
        let pdfToDownload = await driver.findElement(By.css(pdfIcon));
        await driver.wait(until.elementIsVisible(pdfToDownload),1000);
        await pdfToDownload.click();
        await driver.sleep(4000);
 
        await driver.quit();
 
}
 
cdepDownload()