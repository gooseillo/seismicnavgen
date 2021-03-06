var allLengthResults;
var allSpResults;
var lineName = document.getElementById('name');
var fileName = document.getElementById('nameSelect');
var msg = document.getElementById('msg');
var lengthFieldsSelected = [];
var spFieldsSelected = [];
var spinit, spfinal, currentName;
var finalArray = [];

function lengthOnChange(){
    var lengthInput = document.getElementById('lengthFile');
    var lengthFile = lengthInput.files[0];
    
    Papa.parse(lengthFile, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: function(results){
            allLengthResults = [];
            allLengthResults.push(results.data);
            // populate select options with field names
            populateOptions(results.meta.fields, 'lengthSelect');
        }
    });
}

function spOnChange(){
    var spInput = document.getElementById('spFile');
    var spFile = spInput.files[0];
    Papa.parse(spFile, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: function(results){
            allSpResults = [];
            allSpResults.push(results.data);
            populateOptions(results.meta.fields, 'spSelect');
        }
    });
}

function getOptions(){
    var select = document.getElementsByTagName('select');
    var selected;
    // add user selected fields to arrays
    for(var i = 0; i < select.length; i++){
        selected = select[i].value;
        if(selected == ""){
            return msg.innerHTML = "Please make sure you've selected an option for all the fields.";
        }
        if(select[i].className === 'lengthSelect'){
            lengthFieldsSelected.push(selected);
        } else if(select[i].className === 'spSelect'){
            spFieldsSelected.push(selected);
        } else {
            console.log("error, no class name");
        }
    }
    // if field is not selected, delete fields and corresponding values from allLengthResults
   for(var j = 0; j < allLengthResults[0].length; j++){
       Object.keys(allLengthResults[0][j]).forEach(function(key){
        if(key !== lineName.value && lengthFieldsSelected.indexOf(key) === -1)
            delete allLengthResults[0][j][key];
       });
   }
   nameCheck();
}

function populateOptions(myArr, className){
    var select = document.getElementsByClassName(className);
    for(var i = 0; i < select.length; i++){
        while(select[i].hasChildNodes()){
            select[i].removeChild(select[i].firstChild);
        }
        for(var j = 0; j < myArr.length; j++){
            var opt = document.createElement('option');
            opt.value = myArr[j];
            opt.innerHTML = myArr[j];
            select[i].appendChild(opt);
        }
        select[i].selectedIndex = -1;
    }
}

function calculate(){
    var spSelectedI = document.getElementById('iSPSelect');
    var spSelectedF = document.getElementById('fSPSelect');
    var selectedLength = document.getElementById('tLengthSelect');
    for(var i = 0; i < allSpResults[0].length; i++){
        var spa, filtered;
        spinit = allSpResults[0][i][spSelectedI.value];
        spfinal = allSpResults[0][i][spSelectedF.value];
        currentName = allSpResults[0][i][fileName.value];
        filtered = allLengthResults[0].filter(result => result[lineName.value] == currentName);
        
        for(var j = filtered.length - 1; j >= 0; j--){
            var tLength;
            if(/\d/.test(filtered[j][selectedLength.value]) == true){
                tLength = getNumber(filtered[j][selectedLength.value]);
            } else {
                tLength = 0;
            }
            spa = spinit + ((spfinal - spinit) / getNumber(filtered[filtered.length-1][selectedLength.value]) * tLength);
            filtered[j]["SPA"] = spa;
        }
        finalArray.push(filtered);
    }
    msg.innerHTML = "Your files are ready! Click Download to download your files.";
    document.getElementById('downloadCsv').disabled = false;
    console.log(finalArray);
}

function getNumber(value){
    // if value is not an integer or float
    if(/^[-+]?[0-9]*\.?[0-9]+$/.test(value) == false){
        // split string at anything that is not . or digit
        return Number(value.split(/[^\.|0-9]/).shift());
    } else {
        return Number(value);
    }
}

function nameCheck(){
    const unique = (value, index, self) => {
        return self.indexOf(value) === index;
    }
    var nameArr1 = [];
    var nameArr2 = [];
    var newArr = [];
    for(var i = 0; i < allLengthResults[0].length; i++){
        nameArr1.push(allLengthResults[0][i][lineName.value]);
    }
    for(var j = 0; j < allSpResults[0].length; j++){
        nameArr2.push(allSpResults[0][j][fileName.value]);
    }
    newArr = nameArr1.filter(unique);
    if(newArr.sort().join(',') === nameArr2.sort().join(',')){
        calculate();
    } else {
        msg.innerHTML = "Error. Line names do not match. Please check your selected options or your csv data.";
    }
}

function download(){
    var zip = new JSZip();
    for(var i = 0; i < finalArray.length; i++){
        var csv = Papa.unparse(finalArray[i]);
        var csvName;
        csvName = finalArray[i][0][lineName.value] + ".csv";
        zip.file(csvName, csv);
    }
    zip.generateAsync({type:"base64"}).then(function(content){
        window.location = "data:application/zip;base64," + content;
    });
    // for(var i = 0; i < finalArray.length; i++){
    //     console.log(finalArray[i][0][lineName.value]);
    // }
    
}

function reset() {
    document.getElementById('myForm').reset();
    var select = document.getElementsByTagName('select');
    for(var i = 0; i < select.length; i++){
        while(select[i].hasChildNodes()){
            select[i].removeChild(select[i].firstChild);
        }
    }
    msg.innerHTML = "";
}