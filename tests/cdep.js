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

       var url = "http://cdep.ro/pls/caseta/ecaseta2015.OrdineZi?oid=2405";

       //selectors fragile
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
 
        let lawFolder = await driver.findElement(By.css(folderIcon));
        await driver.wait(until.elementIsVisible(lawFolder),1000);
        await lawFolder.click();

        let plNumberHolder = await driver.findElement(By.css(plNumberText));
        await driver.wait(until.elementIsVisible(plNumberHolder),1000);
        driver.executeScript("window.scrollBy(0, 450)", "");
        console.log('plNumber is: ', await plNumberHolder.getText());
        
        await driver.switchTo().frame(driver.findElement(By.css(iFrameId)));
        
        let pdfToDownload = await driver.findElement(By.css(pdfIcon));
        await driver.wait(until.elementIsVisible(pdfToDownload),1000);
        await pdfToDownload.click();
        await driver.sleep(4000);
 
        await driver.quit();
 
}
 
cdepDownload()