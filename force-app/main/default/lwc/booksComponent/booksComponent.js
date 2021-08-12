import UserPreferencesRecordHomeSectionCollapseWTShown from '@salesforce/schema/User.UserPreferencesRecordHomeSectionCollapseWTShown';
import { LightningElement,track } from 'lwc';
const columns = [
    {label:'Id',fieldName:'id',type:'text'},
    {label:'Title',fieldName:'title',type:'text'},
    {label:'Publisher',fieldName:'publisher',type:'text'},
    {label:'Published Date',fieldName:'publishedDate',type:'text'},
    {label:'Cost',fieldName:'cost',type:'currency'}];

export default class LwcMakeCallout extends LightningElement {
    receivedMessage;
    hasRendered = false;
    columns = columns;
    cbxOptions = [];
    books = [];
    @track data = [];
    totalItems = 0;
    startIndex = 0;
    endIndex = 9;
    startNum = 0;
    endNum = 0;
    currentPage = 1;
    totalPages = 0;
    fbDisabled = false;
    pbDisabled = false;
    nbDisabled = false;
    lbDisabled = false;
    cbxValue = 1;
    
    getFirstPage(){
        this.startIndex = 0;
        this.startNum = 1;
        this.endIndex = 9;
        this.endNum = 10;
        this.currentPage = 1;
        this.cbxValue = this.currentPage;
        this.getData();
    }

    getPrevData(){
        this.startIndex = this.startNum - 11;
        this.endIndex = this.endIndex - 10;
        this.currentPage = this.currentPage - 1;
        this.cbxValue = this.currentPage;
        this.getData();
    }
    
    getNextData(){
        console.log('Im on next data');
        this.startIndex = this.endNum;
        this.endIndex = this.endIndex + 10;
        this.currentPage = this.currentPage + 1;
        this.cbxValue = this.currentPage;
        this.getData();
    }

    getLastPage(){
        this.startIndex = (this.totalPages - 1 ) * 10;
        this.startNum = this.startIndex + 1;
        this.endIndex = this.totalItems - 1;
        this.endNum = this.totalItems;
        this.currentPage = this.totalPages;
        this.cbxValue = this.currentPage;
        this.getData();
    }

    getData() {
        this.data = [];
        this.books = [];
        this.startNum = this.startIndex + 1;
        this.endNum = this.endIndex + 1;

        if(this.startIndex == 0){
            this.fbDisabled = true;
            this.pbDisabled = true;
        }
        else{
            this.fbDisabled = false;
            this.pbDisabled = false;
        }
        
        if(this.endNum == this.totalItems){
            this.nbDisabled = true;
            this.lbDisabled = true;
        }
        else{
            this.nbDisabled = false;
            this.lbDisabled = false;
        }

        const calloutURI = 'https://www.googleapis.com/books/v1/volumes?langRestrict=en&q=salesforce&startIndex=' + this.startIndex;
        // requires whitelisting of calloutURI in CSP Trusted Sites
        fetch(calloutURI, {
            method: "GET",
            headers: {
                "Accept": "application/json",
                "Host": window.location.host
              }
        }).then(
            (response) => {
                if (response.ok) {
                    return response.json();
                } 
                else
                    this.receivedMessage = response.status + ' ' + response.statusText;
            }
        ).then(responseJSON => {
            if(responseJSON != undefined && responseJSON != null){
                for(var i=0;i<responseJSON.items.length;i++){
                    
                    var cost = responseJSON.items[i].saleInfo.saleability == 'NOT_FOR_SALE' ? 0.0 : responseJSON.items[i].saleInfo.listPrice.amount;
                    var newBook = {
                        id:responseJSON.items[i].id,
                        title:responseJSON.items[i].volumeInfo.title,
                        publisher:responseJSON.items[i].volumeInfo.publisher,
                        publishedDate:responseJSON.items[i].volumeInfo.publishedDate,
                        cost:cost
                    };
                    this.books.push(newBook);
                }
            }
            this.data = this.books;
            if(this.startIndex == 0){
                this.totalItems = responseJSON.totalItems;
                this.totalPages = Math.ceil(this.totalItems/10);
                var items = [];
                for(var i=1;i<=this.totalPages;i++){
                    var item = {
                        "label": i,
                        "value": i
                    };
                    items.push(item);
                }
                this.cbxOptions = items;
            }
        })
        .catch(error =>{
            this.receivedMessage = error;
        });
    }

    renderedCallback() {
        if(this.hasRendered == false) {
            this.getData();
            this.hasRendered = true;
        }
    }

    handleChange(event) {
        this.cbxValue = parseInt(event.detail.value);
        this.currentPage = this.cbxValue;
        this.startIndex = (this.cbxValue - 1 ) * 10;
        this.startNum = this.startIndex + 1;
        this.endIndex = this.startIndex + 9;
        this.endNum = this.startIndex + 10;
        this.getData();
    }
}