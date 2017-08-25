var MyForm = {
    
    //разрешенные доменные зоны для email
    emailDomen:['ya.ru','yandex.ru','yandex.ua', 'yandex.by', 'yandex.kz', 'yandex.com'],
    
    //получим форму с которой работаем
    getForm : function(){
        return document.forms['myForm'];
    },
    
    //получим кнопку отправки формы
    submitButton : function(){
        return document.getElementById("submitButton");
    },
    
    //получим контейнер для вывода результат
    resultContainer : function(){
        return document.getElementById("resultContainer");
    },
    
    //избавляемся от лишних пробелов или заменяем их чем то другим
    replaceProbel : function(str,rep){
        if(rep === undefined){
            rep = ' ';
        }
        return (str.trim()).replace(/\s{2,}|\s/g,rep);
    },
    
    //очистим стили инпутов
    clearStyleInput : function(){
        for(var i = 0; i < this.getForm().elements.length; i++){
            if(this.getForm().elements[i].type==="text"){
                this.getForm().elements[i].className = "form-control";
            }
        }
    },
    
    //проверим фио
    checkFio : function(fio){
        fio = this.replaceProbel(fio);//уберем лишние пробелы
        if( (fio.split(' ')).length === 3 ){
            return true;
        }else{
            return false;
        }
        
    },
    
    //проверим email
    checkEmail : function(email){
        for(var i = 0 ; i < this.emailDomen.length; i++){
            var regexp = "@"+this.emailDomen[i]+"$";
            var re = new RegExp(regexp,"g");
            if(email.search(re) !== -1){
                return true;
            }
        }
        return false;
    },
    
    //проверим телефон
    checkPhone : function(phone){
        phone = this.replaceProbel(phone,'');//уберем все пробелы
        if(phone.search(/^\+7\(\d{3}\)\d{3}-\d{2}-\d{2}$/) === -1){
            return false;
        }
        var num = phone.match(/\d/g);
        var sum = 0;
        for(var i = 0; i < num.length; i++){
            sum += parseInt(num[i]);
        }
        if(sum < 30){
            return true;
        }
        return false;
    },
    
    //обработаем ответ от сервера
    resultRequest : function(data,request){
        var resultContainer = this.resultContainer();
        switch(data.status){
            case "success":
                resultContainer.innerText = "Success";
                resultContainer.className = "col success";
                this.submitButton().removeAttribute("disabled");
                break;
            case "error":
                resultContainer.className = "col error";
                resultContainer.innerText = data.reason;
                this.submitButton().removeAttribute("disabled");
                break;  
            case "progress":
                //повторно обращаемся к серверу
                setTimeout(function(){MyForm.request(request)},parseInt(data.timeout));
                break;
        }
    },
    
    //пошлем запрос на сервер
    request : function(data){
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4 && xhr.status == 200) {
                try {
                    MyForm.resultRequest(JSON.parse(xhr.responseText),data);
                } catch(err) {
                    console.log(err);
                    alert("Ошибка ответа сервера");
                    return;
                }
            }
        };
        xhr.open('POST', this.getForm().action, true);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.send(JSON.stringify(data));
    },
    
    validate : function(){ 
        var data = this.getData();
        var res = {isValid : true , errorFields: []};
        if(!this.checkFio(data.fio)){
            res.errorFields.push("fio");
        }
        if(!this.checkEmail(data.email)){
            res.errorFields.push("email");
        }
        if(!this.checkPhone(data.phone)){
            res.errorFields.push("phone");
        }
        res.isValid = (res.errorFields.length === 0)?true:false;
        return res;
    },

    getData : function(){ 
        var res = {};
        for(var i = 0; i < this.getForm().elements.length; i++){
            if(this.getForm().elements[i].type==="text"){
                res[this.getForm().elements[i].name] = this.getForm().elements[i].value;
            }
        }
        return res;
    },

    setData : function(data){ 
        for(var index in data) { 
            if(this.getForm()[index] !== undefined){
                this.getForm()[index].value = data[index];
            }
        }
    },

    submit : function(){ 
        this.clearStyleInput();
        var validate = this.validate();
        if(validate.isValid){
            this.submitButton().setAttribute("disabled", "true");
            this.request(this.getData());
        }else{
            this.submitButton().removeAttribute("disabled");
            for(var i = 0; i <  validate.errorFields.length; i++){
                this.getForm()[validate.errorFields[i]].className += " error";
            }
        }
        return false;
    }
}