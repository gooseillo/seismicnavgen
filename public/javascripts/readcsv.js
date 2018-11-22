var allLengthResults;
var allSpResults;
var lineName = document.getElementById('name');
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
   calculate();
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
    }
}

function calculate(){
    var spSelectedI = document.getElementById('iSPSelect');
    var spSelectedF = document.getElementById('fSPSelect');
    var fileName = document.getElementById('nameSelect');
    var selectedLength = document.getElementById('tLengthSelect');
    for(var i = 0; i < allSpResults[0].length; i++){
        var spa, filtered;
        spinit = allSpResults[0][i][spSelectedI.value];
        spfinal = allSpResults[0][i][spSelectedF.value];
        currentName = allSpResults[0][i][fileName.value];
        filtered = allLengthResults[0].filter(result => result[lineName.value] == currentName);
        
        for(var j = filtered.length - 1; j >= 0; j--){
            var tLength;
            if(filtered[j][selectedLength.value] == '---'){
                tLength = 0;
            } else {
                tLength = getNumber(filtered[j][selectedLength.value]);
            }
            spa = spinit + ((spfinal - spinit) / getNumber(filtered[filtered.length-1][selectedLength.value]) * tLength);
            filtered[j]["SPA"] = spa;
        }
        finalArray.push(filtered);
    }
    document.getElementById('msg').innerHTML = "Your files are ready! Click Download to download your files.";
    console.log(finalArray);
}

function getNumber(value){
    return Number(value.split(/\D/).shift());
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
}