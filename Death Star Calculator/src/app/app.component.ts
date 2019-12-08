import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import 'rxjs/add/operator/map';
import { NgSelectConfig } from '@ng-select/ng-select';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent {
  myControl = new FormControl();
  peoples: Array<any>;
  enemy: string;
  public enemiesList: Array<any>;
  filteredOptions: Observable<any[]>;
  homeworlds: Array<any>;
  calculatedVolume: number;
  informationList: Array<any>;
  isNew: number = 1;
  isLoading: boolean = false;
  constructor(private http: HttpClient, private config: NgSelectConfig) {
    this.config.notFoundText = 'Search by person name';
    this.config.appendTo = 'body';
  }


  ngOnInit() {
    //Initialization of arrays
    this.enemiesList = new Array<any>();
    this.homeworlds = new Array<any>();
    this.informationList = new Array<any>();
  }

  //onSearch event
  onSearch(event) {
    if (event.term != undefined && event.term.length > 1
      && (this.peoples == undefined || (this.peoples != undefined && this.peoples.length == 0))) {
      this.getPeople(event.term);
    }
  }


  onSelectEnemy() {
    if (this.enemiesList == undefined) {
      this.enemiesList = new Array<any>();
    }
    debugger
    var index = this.peoples.findIndex(item => item.name == this.enemy);
    if (index > -1) {
      this.enemiesList.push(this.peoples[index]);
    }
  }

  getPeople(search) {
    this.http.get('https://swapi.co/api/people/?' + search).subscribe((res: any) => {
      this.peoples = res.results;
    },
      error => {
        console.log(error);
      });
  }

  onCalculateSum() {
    // volume = 4/3 pi r3
    // radius = 1/2 diameter
    this.isLoading = true;
    this.homeworlds = new Array<any>();

    var distinct = []
    for (var i = 0; i < this.enemiesList.length; i++) {
      var index = -1;
      var homeworld = this.peoples.find(item => item.name == this.enemiesList[i]).homeworld;
      if (distinct != undefined && distinct.length > 0)
        index = distinct.findIndex(item => item.homeworld == homeworld);
      if (index == -1) {
        distinct.push(this.enemiesList[i])
      }
    }


    this.calculatedVolume = 0;

    distinct.forEach(element => {
      var index = this.peoples.findIndex(item => item.name == element);
      if (index > -1) {
        this.http.get(this.peoples[index].homeworld).subscribe((res: any) => {
          let radius = res.diameter / 2;
          // volume in cm3
          let volume = 4 / 3 * Math.PI * Math.pow(radius, 3);
          // volume in km3
          volume = Math.round(volume / 1000);
          res.volume = volume;
          this.homeworlds.push(res);
          this.calculatedVolume = this.calculatedVolume + volume;
          this.isLoading = false;
        },
          error => {
            console.log(error);
            this.isLoading = false;
          });
      }
    });
  }

  onAccept() {
    let obj = { names: this.enemiesList.toString(), volume: this.calculatedVolume };
    this.informationList.push(obj);
    this.enemiesList = new Array<any>();
    this.peoples = new Array<any>();
    this.homeworlds = new Array<any>();
    this.calculatedVolume = undefined;
    this.isNew = 1
  }
}