import {AfterViewInit, Component, ElementRef, OnDestroy, ViewChild} from '@angular/core';
import {CommonModule} from '@angular/common';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import TileWMS from 'ol/source/TileWMS';
import {DragBox} from 'ol/interaction';
import Overlay from 'ol/Overlay';
import DragPan from 'ol/interaction/DragPan';
import Draw from 'ol/interaction/Draw';
import {getArea} from 'ol/sphere';
import VectorSource from 'ol/source/Vector';
import {Polygon} from 'ol/geom';
import {FormsModule} from "@angular/forms";
import {XYZ} from 'ol/source';
import {fromLonLat, toLonLat} from 'ol/proj';



async function fetchTransformerData(transformerId: string): Promise<any> {
  const response = await fetch(`http://localhost:8080/api/transformers/123/data`);
  if (!response.ok) {
    console.error("Error fetching transformer data");
    return { temperature: "-", voltage: "-", current: "-", status: "N/A" };
  }
  return await response.json();
}

@Component({
  selector: 'app-maps',
  standalone: true,
    imports: [CommonModule, FormsModule],
  templateUrl: './maps.component.html',
  styleUrls: ['./maps.component.css']
})
export class MapsComponent implements AfterViewInit, OnDestroy {
  @ViewChild('mapContainer', { static: false }) mapContainerRef!: ElementRef;
  @ViewChild('selectionBox', { static: false }) selectionBoxRef!: ElementRef;
  map!: Map;
  private baseLayers: { [key: string]: TileLayer } = {};
  private overlayLayers: TileLayer[] = [];
  private dragBox!: DragBox;
  private popupOverlay!: Overlay;
  private popupContainer!: HTMLElement;
  private popupContent!: HTMLElement;
  private resizeObserver!: ResizeObserver;
  private magnifierActive = false;
  private magnifierMouseMoveHandler?: (e: MouseEvent) => void;
  private magnifierClickHandler?: () => void;
  private coordinateModeActive = false;

  searchQuery = '';

  selectedMap: string = 'osm';

  layerVisibility: { [key: string]: boolean } = {
    geoserver1: true,
    geoserver2: false
  };
  private dragPanInteraction: any | undefined;


private drawInteraction!: Draw;
private measureTooltipElement!: HTMLElement;
private measureTooltipOverlay!: Overlay;
  private magnifierCanvas!: HTMLCanvasElement;
  private magnifierContext!: CanvasRenderingContext2D | null;

  private magnifierKeyHandler?: (e: KeyboardEvent) => void;
  private animationFrameId?: number;

  enableMagnifier(): void {
    if (this.magnifierActive) {
      this.disableMagnifier();
      return;
    }

    const mapViewport = this.map.getViewport();
    const dpr = window.devicePixelRatio || 1;
    const magnifierSize = 150;
    const zoomFactor = 2.5;

    // Создание элемента лупы
    this.magnifierCanvas = document.createElement('canvas');
    this.magnifierCanvas.style.position = 'absolute';
    this.magnifierCanvas.style.pointerEvents = 'none';
    this.magnifierCanvas.style.border = '2px solid #2196F3';
    this.magnifierCanvas.style.borderRadius = '50%';
    this.magnifierCanvas.style.width = `${magnifierSize}px`;
    this.magnifierCanvas.style.height = `${magnifierSize}px`;
    this.magnifierCanvas.style.zIndex = '9999';
    this.magnifierCanvas.width = magnifierSize * dpr;
    this.magnifierCanvas.height = magnifierSize * dpr;

    // Добавление в DOM
    mapViewport.appendChild(this.magnifierCanvas);

    const magnifierCtx = this.magnifierCanvas.getContext('2d');
    if (!magnifierCtx) return;

    // Обработчик движения мыши
    this.magnifierMouseMoveHandler = (e: MouseEvent) => {
      if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId);
      }
      this.animationFrameId = requestAnimationFrame(() => this.updateMagnifier(e, magnifierCtx, magnifierSize, zoomFactor, dpr));
    };

    // Обработчик клика на лупу
    this.magnifierClickHandler = () => this.disableMagnifier();

    // Обработчик клавиши Esc
    this.magnifierKeyHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') this.disableMagnifier();
    };

    // Регистрация обработчиков
    mapViewport.addEventListener('mousemove', this.magnifierMouseMoveHandler);
    this.magnifierCanvas.addEventListener('click', this.magnifierClickHandler);
    document.addEventListener('keydown', this.magnifierKeyHandler);

    this.magnifierActive = true;
  }

  private updateMagnifier(
    e: MouseEvent,
    ctx: CanvasRenderingContext2D,
    size: number,
    zoom: number,
    dpr: number
  ): void {
    const mapViewport = this.map.getViewport();
    const rect = mapViewport.getBoundingClientRect();
    const pixel = [e.clientX - rect.left, e.clientY - rect.top];
    const coordinate = this.map.getCoordinateFromPixel(pixel);
    const mapCanvas = mapViewport.querySelector('canvas');

    if (!mapCanvas) return;

    ctx.save();
    ctx.clearRect(0, 0, this.magnifierCanvas.width, this.magnifierCanvas.height);

    // Отрисовка лупы
    ctx.beginPath();
    ctx.arc(
      this.magnifierCanvas.width / 2,
      this.magnifierCanvas.height / 2,
      (size * dpr) / 2,
      0,
      Math.PI * 2
    );
    ctx.clip();

    const magnifiedPixel = this.map.getPixelFromCoordinate(coordinate);
    const scale = zoom;
    const sx = (magnifiedPixel[0] * dpr) - (this.magnifierCanvas.width / (2 * scale));
    const sy = (magnifiedPixel[1] * dpr) - (this.magnifierCanvas.height / (2 * scale));

    ctx.setTransform(scale, 0, 0, scale, -sx * scale, -sy * scale);
    ctx.drawImage(mapCanvas, 0, 0);
    ctx.restore();

    // Позиционирование
    this.magnifierCanvas.style.left = `${e.clientX - rect.left - size / 2}px`;
    this.magnifierCanvas.style.top = `${e.clientY - rect.top - size / 2}px`;
  }

  private disableMagnifier(): void {
    if (!this.magnifierActive) return;

    // Отмена анимации
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = undefined;
    }

    // Удаление обработчиков
    if (this.magnifierMouseMoveHandler) {
      this.map.getViewport().removeEventListener(
        'mousemove',
        this.magnifierMouseMoveHandler
      );
    }

    if (this.magnifierClickHandler) {
      this.magnifierCanvas?.removeEventListener(
        'click',
        this.magnifierClickHandler
      );
    }

    if (this.magnifierKeyHandler) {
      document.removeEventListener('keydown', this.magnifierKeyHandler);
    }

    // Удаление элемента
    if (this.magnifierCanvas?.parentNode) {
      this.magnifierCanvas.parentNode.removeChild(this.magnifierCanvas);
    }

    // Сброс ссылок
    this.magnifierCanvas = null!;
    this.magnifierMouseMoveHandler = undefined;
    this.magnifierClickHandler = undefined;
    this.magnifierKeyHandler = undefined;
    this.magnifierActive = false;
  }

  enableAreaMeasurement(): void {
  if (this.drawInteraction) this.map.removeInteraction(this.drawInteraction);

this.drawInteraction = new Draw({
  source: new VectorSource(), // временный source, если нужен визуальный стиль
  type: 'Polygon'
});

this.map.addInteraction(this.drawInteraction);

this.drawInteraction.on('drawend', (event) => {
  const polygon = event.feature.getGeometry() as Polygon;
  const area = getArea(polygon);

  const output = area > 10000
    ? `${(area / 1000000).toFixed(2)} km²`
    : `${area.toFixed(2)} m²`;

  const coordinates = polygon.getInteriorPoint().getCoordinates();

  // Создаем popup для отображения результата
  this.popupContent.innerHTML = `<strong>Площадь:</strong> ${output}`;
  this.popupOverlay.setPosition(coordinates);
  this.popupContainer.style.display = 'block';

  // Отключаем режим после одного измерения
  this.map.removeInteraction(this.drawInteraction);
});
}
  ngAfterViewInit(): void {
    this.initializeMap();
  }

  ngOnDestroy(): void {
    this.disableMagnifier();
    if (this.map) {
      this.map.setTarget(undefined); // ← исправлено
    }
  }



  enableScreenshotMode(): void {
    const mapElement = this.map.getTargetElement();
    const selectionBox = this.selectionBoxRef.nativeElement as HTMLDivElement;
    let startPos = { x: 0, y: 0 };
    let isDrawing = false;


    if (this.dragPanInteraction) {
      this.dragPanInteraction.setActive(false);
    }

    const getRelativePosition = (e: MouseEvent) => ({
      x: e.clientX,
      y: e.clientY
    });

    const onMouseDown = (e: MouseEvent) => {
      isDrawing = true;
      startPos = getRelativePosition(e);
      selectionBox.style.left = `${startPos.x}px`;
      selectionBox.style.top = `${startPos.y}px`;
      selectionBox.style.width = '0';
      selectionBox.style.height = '0';
      selectionBox.style.display = 'block';
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDrawing) return;
      const pos = getRelativePosition(e);

      const x = Math.min(startPos.x, pos.x);
      const y = Math.min(startPos.y, pos.y);
      const width = Math.abs(pos.x - startPos.x);
      const height = Math.abs(pos.y - startPos.y);

      selectionBox.style.left = `${x}px`;
      selectionBox.style.top = `${y}px`;
      selectionBox.style.width = `${width}px`;
      selectionBox.style.height = `${height}px`;
    };

    const onMouseUp = (e: MouseEvent) => {
      if (!isDrawing) return;
      isDrawing = false;
      selectionBox.style.display = 'none';

      const pos = getRelativePosition(e);
      const x = Math.min(startPos.x, pos.x);
      const y = Math.min(startPos.y, pos.y);
      const width = Math.abs(pos.x - startPos.x);
      const height = Math.abs(pos.y - startPos.y);

      this.captureClippedScreenshot(x, y, width, height);

      // Включаем обратно перемещение карты
      if (this.dragPanInteraction) {
        this.dragPanInteraction.setActive(true);
      }

      // Удаляем обработчики
      mapElement.removeEventListener('mousemove', onMouseMove);
      mapElement.removeEventListener('mouseup', onMouseUp);
    };

    mapElement.addEventListener('mousedown', onMouseDown);
    mapElement.addEventListener('mousemove', onMouseMove);
    mapElement.addEventListener('mouseup', onMouseUp);
    mapElement.style.cursor = 'crosshair';
  }

  captureClippedScreenshot(x: number, y: number, width: number, height: number): void {
    setTimeout(() => {
      const mapCanvas = this.map.getViewport().querySelector('canvas');
      if (!mapCanvas) return;

      const mapRect = this.map.getViewport().getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;

      // Исправлено: координаты x, y теперь относительно карты, а не окна браузера
      const relativeX = x - mapRect.left;
      const relativeY = y - mapRect.top;

      const scaleX = mapCanvas.width / mapRect.width;
      const scaleY = mapCanvas.height / mapRect.height;

      const scaledX = relativeX * scaleX;
      const scaledY = relativeY * scaleY;
      const scaledWidth = width * scaleX;
      const scaledHeight = height * scaleY;

      const croppedCanvas = document.createElement('canvas');
      croppedCanvas.width = scaledWidth;
      croppedCanvas.height = scaledHeight;

      const ctx = croppedCanvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(
          mapCanvas,
          scaledX, scaledY, scaledWidth, scaledHeight, // from source
          0, 0, scaledWidth, scaledHeight              // to destination
        );

        croppedCanvas.toBlob(blob => {
          const link = document.createElement('a');
          link.href = URL.createObjectURL(blob!);
          link.download = 'map-screenshot.png';
          link.click();
        }, 'image/png');
      }
    }, 100);
  }

  private getLayerCanvas(layer: TileLayer): HTMLCanvasElement | null {
    const layerId = layer.get('id');
    const container = this.map.getViewport().querySelector(
      `.ol-layer[data-layer="${layerId}"] canvas`
    );
    return container ? container as HTMLCanvasElement : null;
  }


  private initializeMap(): void {
    this.baseLayers = {
      osm: new TileLayer({
        source: new OSM({
          crossOrigin: 'anonymous'
        }),
        visible: this.selectedMap === 'osm'
      }),
     google: new TileLayer({
         source: new XYZ({
          url: 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
          crossOrigin: 'anonymous'
         }),
         visible: this.selectedMap === 'google'
      }),
       yandex: new TileLayer({
        source: new XYZ({
          url: 'https://core-renderer-tiles.maps.yandex.net/tiles?l=map&x={x}&y={y}&z={z}',
         crossOrigin: 'anonymous'
         }),
         visible: this.selectedMap === 'yandex'
       }),
       twoGis: new TileLayer({
      source: new XYZ({
           url: 'https://core-renderer-tiles.maps.yandex.net/tiles?l=map&x={x}&y={y}&z={z}',
          crossOrigin: 'anonymous'
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
          serverType: 'geoserver',
          crossOrigin: 'anonymous'
        }),
        visible: this.layerVisibility['geoserver1']
      }),
      new TileLayer({
        source: new TileWMS({
          url: 'http://localhost:8081/geoserver/wms',
          params: {
            'LAYERS': 'gis:transformers',
            'TILED': true
          },
          serverType: 'geoserver',
          crossOrigin: 'anonymous'
        }),
        visible: this.layerVisibility['geoserver2']
      }),
      new TileLayer({
        source: new TileWMS({
          url: 'http://localhost:8081/geoserver/wms',
          params: {
            'LAYERS': 'gis:electric_network_branches',
            'TILED': true
          },
          serverType: 'geoserver',
          crossOrigin: 'anonymous'
        }),
        visible: this.layerVisibility['geoserver3']
      }),
      new TileLayer({
        source: new TileWMS({
          url: 'http://localhost:8081/geoserver/wms',
          params: {
            'LAYERS': 'gis:res_offices',
            'TILED': true
          },
          serverType: 'geoserver',
          crossOrigin: 'anonymous'
        }),
        visible: this.layerVisibility['geoserver4']
      }),
      new TileLayer({
        source: new TileWMS({
          url: 'http://localhost:8081/geoserver/wms',
          params: {
            'LAYERS': 'tiger:tiger_roads',
            'TILED': true
          },
          serverType: 'geoserver',
          crossOrigin: 'anonymous'
        }),
        visible: this.layerVisibility['geoserver5']
      }),
      new TileLayer({
        source: new TileWMS({
          url: 'http://localhost:8081/geoserver/wms',
          params: {
            'LAYERS': 'tiger:poly_landmarks',
            'TILED': true
          },
          serverType: 'geoserver',
          crossOrigin: 'anonymous'
        }),
        visible: this.layerVisibility['geoserver6']
      }),
      new TileLayer({
        source: new TileWMS({
          url: 'http://localhost:8081/geoserver/wms',
          params: {
            'LAYERS': 'tiger:giant_polygon',
            'TILED': true
          },
          serverType: 'geoserver',
          crossOrigin: 'anonymous'
        }),
        visible: this.layerVisibility['geoserver7']
      }),
      new TileLayer({
        source: new TileWMS({
          url: 'http://localhost:8081/geoserver/wms',
          params: {
            'LAYERS': 'tiger:poi',
            'TILED': true
          },
          serverType: 'geoserver',
          crossOrigin: 'anonymous'
        }),
        visible: this.layerVisibility['geoserver8']
      }),
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
    this.dragPanInteraction = this.map.getInteractions().getArray().find(i => i instanceof DragPan);

    // this.popupContainer = document.createElement('div');
    // this.popupContainer.className = 'ol-popup';
    // this.popupContent = document.createElement('div');
    // this.popupContainer.appendChild(this.popupContent);
    //
    // this.popupOverlay = new Overlay({
    //   element: this.popupContainer,
    //   positioning: 'bottom-center',
    //   stopEvent: false,
    //   offset: [0, -10],
    // });
    //
    // this.map.addOverlay(this.popupOverlay);

    this.popupContainer = document.getElementById('popup')!;
    this.popupContent = document.getElementById('popup-content')!;
    this.popupOverlay = new Overlay({
      element: this.popupContainer,
      positioning: 'bottom-center',
      stopEvent: false,
      offset: [0, 0] // раньше было -15 или -20
    });


    this.map.addOverlay(this.popupOverlay);


// Обработчик наведения на объекты
    this.map.on('pointermove', async (evt) => {
      if (this.coordinateModeActive) {
        this.popupContainer.style.display = 'none'; // скрываем, если включен режим координат
        return;
      }
      const viewResolution = this.map.getView().getResolution();

      const checkLayers = [
        { index: 2, api: 'http://localhost:8080/api/pes/', type: 'pes' }, // geoserver3
        { index: 0, api: 'http://localhost:8080/api/transformers/', type: 'transformer' }, // geoserver1
        { index: 3, api: 'http://localhost:8080/api/res/', type: 'res' } // geoserver4
      ];

      for (const layer of checkLayers) {
        const source = this.overlayLayers[layer.index].getSource() as TileWMS;
        const url = source.getFeatureInfoUrl(
          evt.coordinate,
          viewResolution!,
          'EPSG:3857',
          { INFO_FORMAT: 'application/json' }
        );

        if (!url) continue;

        try {
          const response = await fetch(url);
          const data = await response.json();

          if (data.features.length > 0) {

            const feature = data.features[0];
            const rawId = feature.id || feature.properties.id || '';
            const featureId = rawId.includes('.') ? rawId.split('.').pop() : rawId;

            const apiUrl = `${layer.api}${featureId}${layer.type === 'pes' || 'res' ? '' : '/data'}`;
            const apiResponse = await fetch(apiUrl);
            const apiData = apiResponse.ok ? await apiResponse.json() : null;

            if (layer.type === 'transformer' && apiData) {
              this.popupContent.innerHTML = `
            <h3>Transformer ${featureId}</h3>
            <p>Temperature: ${apiData.temperature} °C</p>
            <p>Voltage: ${apiData.voltage} V</p>
            <p>Current: ${apiData.current} A</p>
            <p>Status: ${apiData.status}</p>
          `;
            }
            if (layer.type === 'res' && apiData) {
              this.popupContent.innerHTML = `
            <h3>${apiData.name}</h3>
            <p><strong>Название:</strong> ${apiData.name}</p>
            <p><strong>Адрес:</strong> ${apiData.address}</p>
            <p><strong>Телефон:</strong> ${apiData.phone}</p>

          `;
            }
            if (layer.type === 'pes' && apiData) {
              this.popupContent.innerHTML = `
            <h3>${apiData.name}</h3>
            <p><strong>Адрес:</strong> ${apiData.address}</p>
            <p><strong>Телефон:</strong> ${apiData.phone}</p>
            <p><strong>Email:</strong> ${apiData.email}</p>
            <p><strong>Сайт:</strong> <a href="${apiData.website}" target="_blank">${apiData.website}</a></p>
            <p><strong>Регион:</strong> ${apiData.region}</p>
          `;
            }

            this.popupOverlay.setPosition(evt.coordinate);
            this.popupContainer.style.display = 'block';
            return; // не проверяем дальше, если нашли
          }
        } catch (err) {
          console.error(`Ошибка при получении ${layer.type}:`, err);
        }
      }

      // если не найдено ни одного объекта
      this.popupContainer.style.display = 'none';
    });


  }
  private clickListener?: (e: any) => void;

  enableCoordinatePicker(): void {
    if (this.coordinateModeActive) {
      this.map.un('singleclick', this.clickListener!);
      this.coordinateModeActive = false;
      this.clickListener = undefined;
      return;
    }

    this.coordinateModeActive = true;

    this.clickListener = (e: any) => {
      const coordinate = e.coordinate;
      const [lon, lat] = toLonLat(coordinate);

      this.popupContent.innerHTML = `
      <p><strong>Долгота:</strong> ${lon.toFixed(6)}</p>
      <p><strong>Широта:</strong> ${lat.toFixed(6)}</p>
    `;
      this.popupOverlay.setPosition(coordinate);
      this.popupContainer.style.display = 'block';

      this.map.un('singleclick', this.clickListener!);
      this.coordinateModeActive = false;
    };

    this.map.on('singleclick', this.clickListener);
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
    this.overlayLayers[2].setVisible(this.layerVisibility['geoserver3']);
    this.overlayLayers[3].setVisible(this.layerVisibility['geoserver4']);
    this.overlayLayers[4].setVisible(this.layerVisibility['geoserver5']);
    this.overlayLayers[5].setVisible(this.layerVisibility['geoserver6']);
    this.overlayLayers[6].setVisible(this.layerVisibility['geoserver7']);
    this.overlayLayers[7].setVisible(this.layerVisibility['geoserver8']);
  }
  captureScreenshot(): void {
    this.map.once('rendercomplete', () => {
      const mapCanvas = document.createElement('canvas');
      const size = this.map.getSize();
      if (!size) return;

      mapCanvas.width = size[0];
      mapCanvas.height = size[1];
      const context = mapCanvas.getContext('2d');
      if (!context) return;

      Array.prototype.forEach.call(
        this.map.getViewport().querySelectorAll('.ol-layer canvas'),
        (canvas: HTMLCanvasElement) => {
          if (canvas.width > 0) {
            const opacity = canvas.style.opacity === '' ? 1 : Number(canvas.style.opacity);
            context.globalAlpha = opacity;
            const transform = canvas.style.transform;
            const matrix = transform.match(/^matrix\(([^\(]*)\)$/);
            if (matrix) {
              const values = matrix[1].split(',').map(Number);
              context.setTransform(values[0], values[1], values[2], values[3], values[4], values[5]);
            }
            context.drawImage(canvas, 0, 0);
          }
        }
      );

      mapCanvas.toBlob((blob: any) => {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'map-screenshot.png';
        link.click();
      });
    });

    this.map.renderSync();
  }

  generateExcelReport(): void {
    const data = [
      ['Название', 'Значение'],
      ['Температура', '22°C'],
      ['Напряжение', '220V'],
      ['Ток', '5A'],
      ['Статус', 'Норма']
    ];

    const csvRows = data.map(row => row.join(',')).join('\n');
    const BOM = '\uFEFF'; // UTF-8 BOM символ

    const blob = new Blob([BOM + csvRows], { type: 'text/csv;charset=utf-8;' });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }


}
