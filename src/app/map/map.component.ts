import { Component, OnInit, AfterViewInit } from '@angular/core';
import L from 'leaflet';
import 'leaflet-draw';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements AfterViewInit {

  private map;
  private drawnItems = new L.FeatureGroup();

  private drawControl;
  private features = {
    base: new L.FeatureGroup(),
    layers: new L.FeatureGroup()
  };

  constructor(private httpClient: HttpClient) { }
  
  ngAfterViewInit(): void {
    this.initMap();
    this.initDraw();
    this.drawPolygon();

    let content = document.querySelector('.leaflet-draw-edit-edit') as HTMLElement
    content.click();
    //this.drawControl._toolbars['edit'].enable();
  }

  private async drawPolygon(){
    let layer = L.polygon([[31.4, 115.7], [31.5, 117.1], [29.5, 117.1], [29.5, 115.1]], {
      weight: 1,
      color: '#3366ff',
      opacity: 1,
      fillColor: '#3366ff',
      fillOpacity: 1,
    });

    this.drawnItems.addLayer(layer);
  }

  initDraw(){
    this.map.addLayer(this.drawnItems);
    this.drawControl = new L.Control.Draw({
      draw: false,
      edit: {
          featureGroup: this.drawnItems,
          remove: false,
      }
    });

    // 隐藏edit handlers tip
    L.drawLocal.edit.handlers.edit.tooltip.text = null;
    L.drawLocal.edit.handlers.edit.tooltip.subtext = null;
    this.map.addControl(this.drawControl);
  }

  initMap(): void {
    this.map = L.map('map', {
      zoom: 7,
      zoomSnap: 0,
      zoomDelta: 0.001,
      zoomControl: false,
      attributionControl: false,
      editable: true,
      printable: true,
      downloadable: true,
      center: [ 31.866942, 117.282699 ]
    });

    this.map.addLayer(this.features.base);
    this.loadBorder("assets/map/city-border.json", "#444", '#fff', 1, 1, 0, '10000, 0', null);
    this.loadBorder("assets/map/province-border.json", "#444", '#fff', 2, 1, 1, '10000, 0', null);

    this.map.on(L.Draw.Event.EDITVERTEX, e => {
      console.log("改变了")
    })
  }

  loadBorder(url, color, fillColor, weight, opacity, fillOpacity, dash, loadedCallback): void {
    this.httpClient.get(url).subscribe((data: any) => {
      let layer = L.geoJSON(data, {
        weight: weight,
        color: color,
        opacity: opacity,
        fillColor: fillColor,
        fillOpacity: fillOpacity,
        dashArray: dash,
        dashOffset: '0'
      });

      this.features.base.addLayer(layer);
      //this.map.addLayer(layer);

      if (loadedCallback != null)
        loadedCallback(layer, data);
    });
  }

}
