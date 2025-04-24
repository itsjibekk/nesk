import { Component, OnDestroy, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import XYZ from 'ol/source/XYZ';
import TileWMS from 'ol/source/TileWMS';
import { fromLonLat } from 'ol/proj';

@Component({
  selector: 'app-maps',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './maps.component.html',
  styleUrls: ['./maps.component.css']
})
export class MapsComponent implements AfterViewInit, OnDestroy {
  @ViewChild('mapContainer', { static: false }) mapContainerRef!: ElementRef;

  private map!: Map;
  private baseLayers: { [key: string]: TileLayer } = {};
  private overlayLayers: TileLayer[] = [];

  selectedMap: string = 'osm';

  layerVisibility: { [key: string]: boolean } = {
    geoserver1: true,
    geoserver2: false
  };

  ngAfterViewInit(): void {
    this.initializeMap();
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.setTarget(undefined); // ← исправлено
    }
  }


  private initializeMap(): void {
    this.baseLayers = {
      osm: new TileLayer({
        source: new OSM(),
        visible: this.selectedMap === 'osm'
      }),
      google: new TileLayer({
        source: new XYZ({
          url: 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}'
        }),
        visible: this.selectedMap === 'google'
      }),
      yandex: new TileLayer({
        source: new XYZ({
          url: 'https://core-renderer-tiles.maps.yandex.net/tiles?l=map&x={x}&y={y}&z={z}'
        }),
        visible: this.selectedMap === 'yandex'
      }),
      twoGis: new TileLayer({
        source: new XYZ({
          url: 'https://core-renderer-tiles.maps.yandex.net/tiles?l=map&x={x}&y={y}&z={z}'
        }),
        visible: this.selectedMap === '2gis'
      })

    };

    this.overlayLayers = [
      new TileLayer({
        source: new TileWMS({
          url: 'http://localhost:8081/geoserver/wms',
          params: {
            'LAYERS': 'gis:poles',
            'TILED': true
          },
          serverType: 'geoserver'
        }),
        visible: this.layerVisibility['geoserver1']
      }),
      new TileLayer({
        source: new TileWMS({
          url: 'http://localhost:8081/geoserver/wms',
          params: {
            'LAYERS': 'sf:roads',
            'TILED': true
          },
          serverType: 'geoserver'
        }),
        visible: this.layerVisibility['geoserver2']
      })
    ];

    this.map = new Map({
      target: this.mapContainerRef.nativeElement,
      layers: [
        ...Object.values(this.baseLayers),
        ...this.overlayLayers
      ],
      view: new View({
        center: fromLonLat([74.597953, 42.874621]),
        zoom: 12
      })
    });
  }

  onMapSelect(event: any): void {
    this.selectedMap = event.target.value;
    this.updateBaseLayerVisibility();
  }

  onLayerToggle(layerKey: string): void {
    this.layerVisibility[layerKey] = !this.layerVisibility[layerKey];
    this.updateOverlayVisibility();
  }

  private updateBaseLayerVisibility(): void {
    Object.keys(this.baseLayers).forEach(key => {
      this.baseLayers[key].setVisible(key === this.selectedMap);
    });
  }

  private updateOverlayVisibility(): void {
    this.overlayLayers[0].setVisible(this.layerVisibility['geoserver1']);
    this.overlayLayers[1].setVisible(this.layerVisibility['geoserver2']);
  }
}
