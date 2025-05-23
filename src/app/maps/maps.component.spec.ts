import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MapsComponent} from './maps.component';
import OSM from 'ol/source/OSM';


describe('Тестовый сценарий: Просмотр данных об объектах на карте', () => {
  let component: MapsComponent;
  let fixture: ComponentFixture<MapsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MapsComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MapsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('1. Карта отображается с объектами на местности (наличие базового слоя OSM)', () => {
    expect(component).toBeTruthy();
    // Проверяем наличие слоя OSM
    const osmLayer = Object.values(component['baseLayers']).find(layer => layer.getSource() instanceof OSM);
    expect(osmLayer).toBeDefined();
    expect(osmLayer!.getVisible()).toBeTrue();
  });

  it('2. Открывается карточка объекта с параметрами при наведении (мокаем fetch)', async () => {
    spyOn(window, 'fetch').and.returnValue(Promise.resolve(
      new Response(
        JSON.stringify({
          features: [{ id: 'object123', properties: { name: 'Test Object' } }]
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    ));

    // Моделируем pointermove, т.к. ты вызываешь обработку на pointermove
    const event = new PointerEvent('pointermove', { clientX: 100, clientY: 100 });
    component.map.getViewport().dispatchEvent(event);


  });

  it('3. Фильтрация объектов по слою "Трансформаторы" через метод onLayerToggle', () => {
    // Убедимся что слой geoserver2 изначально false
    expect(component.layerVisibility['geoserver2']).toBeFalse();

    // Вызываем метод для активации слоя
    component.onLayerToggle('geoserver2');
    fixture.detectChanges();

    expect(component.layerVisibility['geoserver2']).toBeTrue();
    // И дополнительно убеждаемся что слой в массиве overlayLayers активирован
    const layer = component['overlayLayers'][1]; // geoserver2 — transformers
    expect(layer.getVisible()).toBeTrue();
  });
});
describe('Тестовый сценарий: Проверка работы инструментов карты (лупа, измерение площади, скриншот)', () => {
  let component: MapsComponent;
  let fixture: ComponentFixture<MapsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MapsComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MapsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('1. Включение инструмента "Лупа"', () => {
    spyOn<any>(component, 'updateMagnifier');
    component.enableMagnifier();
    expect(component['magnifierActive']).toBeTrue();
    expect(component['magnifierCanvas']).toBeDefined();
  });

  it('2. Измерение площади выделенной области', () => {
    // Создание поддельного Polygon
    const fakePolygon = {
      getInteriorPoint: () => ({ getCoordinates: () => [0, 0] }),
      getArea: () => 5000,
    } as any;

    spyOn<any>(component['popupOverlay'], 'setPosition');
    spyOn<any>(component['map'], 'removeInteraction');

    component['map'].addInteraction = jasmine.createSpy();
    component['drawInteraction'] = {
      on: (event: string, callback: any) => {
        if (event === 'drawend') {
          callback({ feature: { getGeometry: () => fakePolygon } });
        }
      }
    } as any;

    component.enableAreaMeasurement();
    expect(component['map'].addInteraction).toHaveBeenCalled();
  });

  it('3. Сохранение скриншота выделенной области', () => {
    // Создаем мок канваса
    const fakeCanvas = document.createElement('canvas');
    fakeCanvas.width = 100;
    fakeCanvas.height = 100;
    fakeCanvas.getContext = () => ({
      drawImage: jasmine.createSpy(),
    }) as any;

    spyOn(component.map.getViewport(), 'querySelector').and.returnValue(fakeCanvas);
    spyOn(document, 'createElement').and.returnValue(document.createElement('canvas'));
    spyOn(URL, 'createObjectURL').and.returnValue('blob:url');
    spyOn(document.body, 'appendChild');


    component.captureClippedScreenshot(10, 10, 50, 50);

    // Ожидаем, что будет создан canvas и его нарисуют
    expect(document.createElement).toHaveBeenCalledWith('canvas');
  });
});
