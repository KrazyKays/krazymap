// Gestionnaire de carte avec Leaflet et brouillard de guerre
import * as L from 'leaflet';
import type { Coordinates, ExploredArea } from './types';
import { FRANCE_BOUNDS } from './types';

export interface MapSettings {
  containerId: string;
  initialZoom: number;
  minZoom: number;
  maxZoom: number;
  fogOpacity: number;
  explorationRadius: number;
}

const DEFAULT_MAP_SETTINGS: MapSettings = {
  containerId: 'map',
  initialZoom: 6,
  minZoom: 5,
  maxZoom: 12,
  fogOpacity: 0.8,
  explorationRadius: 2000,
};

export class MapManager {
  private map: L.Map | null = null;
  private fogLayer: L.Layer | null = null;
  private playerMarker: L.Marker | null = null;
  private targetMarker: L.Marker | null = null;
  private eventMarkers: Map<string, L.Marker> = new Map();
  private tilesLayer: L.TileLayer | null = null;
  private canvasOverlay: any = null;
  private settings: MapSettings;
  
  constructor(containerId: string = 'map', settings: Partial<MapSettings> = {}) {
    this.settings = { ...DEFAULT_MAP_SETTINGS, ...settings };
    this.settings.containerId = containerId;
  }
  
  initialize(lat: number = 46.5, lon: number = 2.0, zoom: number = this.settings.initialZoom): void {
    const mapOptions: any = {
      center: [lat, lon],
      zoom: zoom,
      minZoom: this.settings.minZoom,
      maxZoom: this.settings.maxZoom,
      attributionControl: true,
      zoomControl: true,
      doubleClickZoom: false,
      boxZoom: false,
    };
    this.map = L.map(this.settings.containerId, mapOptions);
    this.tilesLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.map);
    const southWest = L.latLng(FRANCE_BOUNDS.minLat, FRANCE_BOUNDS.minLon);
    const northEast = L.latLng(FRANCE_BOUNDS.maxLat, FRANCE_BOUNDS.maxLon);
    this.map.setMaxBounds(L.latLngBounds(southWest, northEast));
    this.map.on('move', () => {
      const bounds = this.map!.getBounds();
      if (!bounds.contains(southWest) || !bounds.contains(northEast)) {
        this.map!.fitBounds(L.latLngBounds(southWest, northEast), { padding: [20, 20] });
      }
    });
    this.addCanvasOverlay();
  }
  
  private addCanvasOverlay(): void {
    if (!this.map) return;
    const CanvasLayerClass = L.Layer.extend({
      onAdd: function(this: any, map: L.Map) {
        const size = map.getSize();
        const canvas = L.DomUtil.create('canvas', 'leaflet-fog-canvas') as HTMLCanvasElement;
        canvas.width = size.x;
        canvas.height = size.y;
        const ctx = canvas.getContext('2d')!;
        const container = map.getPanes()['overlayPane'];
        L.DomUtil.addClass(container, 'leaflet-fog-container');
        container.appendChild(canvas);
        this._canvas = canvas;
        this._ctx = ctx;
        map.on('move', () => this.drawCanvas(map, canvas, ctx));
        map.on('zoom', () => this.drawCanvas(map, canvas, ctx));
        map.on('resize', () => {
          const newSize = map.getSize();
          canvas.width = newSize.x;
          canvas.height = newSize.y;
          this.drawCanvas(map, canvas, ctx);
        });
        this.drawCanvas(map, canvas, ctx);
      },
      onRemove: function(this: any) {
        if (this._canvas) {
          const container = this._canvas.parentNode;
          if (container) container.removeChild(this._canvas);
        }
      },
      drawCanvas: function(this: any, map: L.Map, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.globalAlpha = 0.8;
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.globalCompositeOperation = 'destination-out';
        const areas = this._exploredAreas || [];
        for (const area of areas) {
          const point = map.latLngToContainerPoint(L.latLng(area.center.lat, area.center.lon));
          const radius = this.metersToPixels(map, area.radius, area.center.lat);
          ctx.beginPath();
          ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = 1;
      },
      metersToPixels: function(this: any, map: L.Map, meters: number, lat: number) {
        const latLng1 = L.latLng(lat, 0);
        const latLng2 = L.latLng(lat, 0.001);
        const point1 = map.latLngToContainerPoint(latLng1);
        const point2 = map.latLngToContainerPoint(latLng2);
        const pixelsPerDegree = Math.abs(point2.x - point1.x);
        const metersPerDegreeLon = 111000 * Math.cos(lat * Math.PI / 180);
        return meters / (metersPerDegreeLon / pixelsPerDegree);
      }
    });
    this.canvasOverlay = new CanvasLayerClass();
    this.canvasOverlay._exploredAreas = [];
    this.canvasOverlay.addTo(this.map);
  }
  
  updateExploredAreas(areas: ExploredArea[]): void {
    if (this.canvasOverlay && this.canvasOverlay._exploredAreas) {
      this.canvasOverlay._exploredAreas = areas;
      if (this.map) {
        const canvas = this.canvasOverlay._canvas as HTMLCanvasElement;
        const ctx = this.canvasOverlay._ctx as CanvasRenderingContext2D;
        if (canvas && ctx) this.canvasOverlay.drawCanvas(this.map, canvas, ctx);
      }
    }
  }
  
  updatePlayerPosition(position: Coordinates): void {
    if (!this.map) return;
    if (this.playerMarker) this.map.removeLayer(this.playerMarker);
    const icon = L.divIcon({
      html: `<svg width="24" height="24" viewBox="0 0 24 24" fill="#FF6B6B"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4" fill="white"/></svg>`,
      iconSize: [24, 24],
      className: 'player-marker'
    });
    this.playerMarker = L.marker([position.lat, position.lon], { icon, zIndexOffset: 1000, riseOnHover: true }).addTo(this.map);
    if (!this.map.getCenter() || Math.abs(this.map.getCenter().lat - position.lat) > 5 || Math.abs(this.map.getCenter().lng - position.lon) > 5) {
      this.map.setView([position.lat, position.lon], this.map.getZoom());
    }
  }
  
  updateTargetPosition(position: Coordinates): void {
    if (!this.map) return;
    if (this.targetMarker) this.map.removeLayer(this.targetMarker);
    const icon = L.divIcon({
      html: `<svg width="24" height="24" viewBox="0 0 24 24" fill="#4ECDC4"><path d="M12 2L4 12l8 10 8-10z"/><circle cx="12" cy="12" r="3" fill="white"/></svg>`,
      iconSize: [24, 24],
      className: 'target-marker'
    });
    this.targetMarker = L.marker([position.lat, position.lon], { icon, zIndexOffset: 1000, opacity: 0, interactive: false }).addTo(this.map);
  }
  
  showTarget(): void {
    if (this.targetMarker) this.targetMarker.setOpacity(1);
  }
  
  updateEventMarkers(events: Array<{ id: string; position: Coordinates; discovered: boolean; type: string }>): void {
    if (!this.map) return;
    for (const [id, marker] of this.eventMarkers) {
      if (!events.some(e => e.id === id)) {
        this.map.removeLayer(marker);
        this.eventMarkers.delete(id);
      }
    }
    const eventIcons: Record<string, string> = {
      quiz: '<svg width="20" height="20" viewBox="0 0 24 24" fill="#FFBE0B"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15v-2h2v2zm0-4v-2h2v2zm0-4v-2h2v2z"/></svg>',
      orientation: '<svg width="20" height="20" viewBox="0 0 24 24" fill="#FF6B6B"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>',
      observation: '<svg width="20" height="20" viewBox="0 0 24 24" fill="#45B7D1"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5z"/></svg>',
      navigation: '<svg width="20" height="20" viewBox="0 0 24 24" fill="#96CEB4"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>',
      ravitaillement: '<svg width="20" height="20" viewBox="0 0 24 24" fill="#FF9FF3"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>',
      revelation: '<svg width="20" height="20" viewBox="0 0 24 24" fill="#FFFFFF"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5z"/></svg>'
    };
    const typeNames: Record<string, string> = {
      quiz: 'Quiz Géographique', orientation: 'Défi d\'Orientation', observation: 'Observation Cartographique',
      navigation: 'Défi de Navigation', ravitaillement: 'Point de Ravitaillement', revelation: 'Révélation Temporaire'
    };
    for (const event of events) {
      if (this.eventMarkers.has(event.id)) continue;
      const iconSvg = eventIcons[event.type] || '<svg width="20" height="20" viewBox="0 0 24 24" fill="#AAAAAA"><circle cx="12" cy="12" r="10"/></svg>';
      const icon = L.divIcon({ html: iconSvg, iconSize: [20, 20], className: `event-marker ${event.type} ${event.discovered ? 'discovered' : 'hidden'}` });
      const marker = L.marker([event.position.lat, event.position.lon], { icon, opacity: event.discovered ? 1 : 0, zIndexOffset: 500, riseOnHover: true }).addTo(this.map);
      marker.bindTooltip(typeNames[event.type] || 'Événement', { permanent: false, direction: 'top', className: 'event-tooltip' });
      this.eventMarkers.set(event.id, marker);
    }
  }
  
  updateEventVisibility(eventId: string, discovered: boolean): void {
    const marker = this.eventMarkers.get(eventId);
    if (marker) marker.setOpacity(discovered ? 1 : 0);
  }
  
  centerOn(position: Coordinates, zoom?: number): void {
    if (this.map) this.map.setView([position.lat, position.lon], zoom || this.map.getZoom());
  }
  
  fitToFrance(): void {
    if (this.map) {
      const southWest = L.latLng(FRANCE_BOUNDS.minLat, FRANCE_BOUNDS.minLon);
      const northEast = L.latLng(FRANCE_BOUNDS.maxLat, FRANCE_BOUNDS.maxLon);
      this.map.fitBounds(L.latLngBounds(southWest, northEast), { padding: [20, 20] });
    }
  }
  
  destroy(): void {
    if (this.map) {
      if (this.playerMarker) this.map.removeLayer(this.playerMarker);
      if (this.targetMarker) this.map.removeLayer(this.targetMarker);
      for (const marker of this.eventMarkers.values()) this.map.removeLayer(marker);
      if (this.canvasOverlay) this.map.removeLayer(this.canvasOverlay);
      if (this.fogLayer) this.map.removeLayer(this.fogLayer);
      if (this.tilesLayer) this.map.removeLayer(this.tilesLayer);
      this.map.remove();
      this.map = null;
    }
    this.playerMarker = null;
    this.targetMarker = null;
    this.eventMarkers.clear();
    this.canvasOverlay = null;
    this.fogLayer = null;
    this.tilesLayer = null;
  }
  
  getMap(): L.Map | null {
    return this.map;
  }
}
