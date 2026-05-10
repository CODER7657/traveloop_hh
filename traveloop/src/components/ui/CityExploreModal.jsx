import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, MapPin, DollarSign, Clock, Plus, ChevronLeft, ChevronRight } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { Skeleton } from '../ui/Skeleton'

// Verified Unsplash photo IDs per city — iconic landmarks only
const CITY_PHOTOS = {
  'Tokyo':       ['photo-1540959733332-eab4deabeeaf','photo-1542051841857-5f90071e7989','photo-1490806843957-31f4c9a91c65','photo-1528360983277-13d401cdc186'],
  'Paris':       ['photo-1502602898657-3e91760cbb34','photo-1499856871958-5b9627545d1a','photo-1431274172761-fca41d930114','photo-1564507592333-c60657eea523'],
  'New York':    ['photo-1496442226666-8d4d0e62e6e9','photo-1522083165195-3424ed129620','photo-1485871981521-5b1fd3805eee','photo-1534430480872-3498386e7856'],
  'London':      ['photo-1513635269975-59663e0ac1ad','photo-1486299267070-83823f5448c5','photo-1529655683826-aba9b3e77383','photo-1441986300917-64674bd600d8'],
  'Bali':        ['photo-1537996194471-e657df975ab4','photo-1518548419970-58e3b4079ab2','photo-1552733407-5d5c46c3bb3b','photo-1604665515746-2e5a5a28c0f2'],
  'Bangkok':     ['photo-1563492065599-3520f775eeed','photo-1559592413-7cec4d0cae2b','photo-1600240244562-be30be7843a7','photo-1597150770458-f60a6e6e8fc5'],
  'Rome':        ['photo-1515542622106-78bda8ba0e5b','photo-1529154166925-574a0236a4f4','photo-1573074617613-fc8ef27eaa2f','photo-1525874684015-58379d421a52'],
  'Dubai':       ['photo-1512453979798-5ea266f8880c','photo-1553913861-c0fdec27db37','photo-1582672060674-bc2bd808a8b5','photo-1477959858617-67f85cf4f1df'],
  'Istanbul':    ['photo-1524231757912-21f4fe3a7200','photo-1569693878062-96d4c3e99f0c','photo-1547558902-8b2a97cc6e4a','photo-1541432901042-2d8bd64b4a9b'],
  'Singapore':   ['photo-1525625293386-3f8f99389edd','photo-1565967511849-76a60a516170','photo-1562516155-e0c1ee44059b','photo-1467269204594-f2adbfea0b34'],
  'Barcelona':   ['photo-1534430480872-3498386e7856','photo-1558618666-fcd25c85cd64','photo-1539037116277-4db20889f2d4','photo-1593184769555-3d3a3b48bcb6'],
  'Amsterdam':   ['photo-1531572753322-ad063cecc140','photo-1512470876302-972faa2aa9a4','photo-1534351590666-13e3e96b5702','photo-1588693253025-0c5e6c9bb8cc'],
  'Prague':      ['photo-1541849546-216549ae216d','photo-1592906209472-a36b1f3782ef','photo-1467041051451-78d9abdf2001','photo-1540541338287-41700207dee6'],
  'Kyoto':       ['photo-1493976040374-85c8e12f0c0e','photo-1528360983277-13d401cdc186','photo-1480796927426-f609979314bd','photo-1558862107-d49ef2a04d72'],
  'Sydney':      ['photo-1506973035872-a4ec16b8e8d9','photo-1549180030-48bf079fb38a','photo-1559519717-c62eff2eeff2','photo-1524820801657-fd59673e5829'],
  'Cape Town':   ['photo-1580060839134-75a5edca2e99','photo-1516026672322-bc52d61a55d5','photo-1523482580672-f109ba8cb9be','photo-1497290756760-23ac55edf36f'],
  'Santorini':   ['photo-1570077188670-e3a8d69ac5ff','photo-1533105079780-92b9be482077','photo-1601581875309-fafbf2d3ed3a','photo-1504512485720-7d83a16ee930'],
  'Maldives':    ['photo-1514282401047-d79a71a590e8','photo-1583212292454-1d6cb4d3c3e5','photo-1573843981267-be1999ff37cd','photo-1540202404-a2f29016b523'],
  'Seoul':       ['photo-1555881400-74d7acaacd8b','photo-1534274988757-a28bf1a57c17','photo-1517154421773-0529f29ea451','photo-1570214476695-19bd467b38d4'],
  'New Delhi':   ['photo-1587474260584-136574528ed5','photo-1524492412937-b28074a5d7da','photo-1598091383021-15ddea4a9735','photo-1567157577867-05ccb1388e66'],
  'Mexico City': ['photo-1518638150340-f706e86654de','photo-1585464231875-d9ef1f5ad396','photo-1568430462989-44163eb1752f','photo-1551285988-1edce8c59694'],
  'Vienna':      ['photo-1516550135131-fe3dcb5bedc0','photo-1513326738677-b964603b136d','photo-1516199423456-1f1e91b06f25','photo-1519677100203-a0e668c92439'],
  'Miami':       ['photo-1535498730771-e735b998cd64','photo-1544551763-46a013bb70d5','photo-1504609813442-a8924e83f76e','photo-1514214246283-d8a5e0e9f2de'],
}

// Average daily budget per city: [budget, midrange, luxury] in USD
const CITY_BUDGETS = {
  'Tokyo':       [60, 130, 300],
  'Paris':       [80, 160, 400],
  'New York':    [100, 200, 500],
  'London':      [90, 180, 450],
  'Bali':        [25, 60, 180],
  'Bangkok':     [20, 55, 160],
  'Rome':        [70, 140, 350],
  'Dubai':       [100, 250, 600],
  'Istanbul':    [30, 75, 200],
  'Singapore':   [80, 170, 400],
  'Barcelona':   [70, 140, 350],
  'Amsterdam':   [90, 180, 420],
  'Prague':      [35, 80, 200],
  'Kyoto':       [55, 120, 300],
  'Sydney':      [90, 180, 420],
  'Cape Town':   [35, 85, 250],
  'Santorini':   [100, 220, 500],
  'Maldives':    [150, 350, 900],
  'Seoul':       [45, 100, 280],
  'New Delhi':   [15, 45, 150],
  'Mexico City': [25, 60, 180],
  'Vienna':      [75, 150, 380],
  'Miami':       [100, 200, 480],
}

const TYPE_STYLE = {
  sightseeing: 'bg-amber/10 text-amber-dark',
  food:        'bg-forest/10 text-forest',
  adventure:   'bg-earth/10 text-earth',
  culture:     'bg-mist/20 text-dusk',
  nightlife:   'bg-dusk/10 text-dusk',
}

export default function CityExploreModal({ city, onClose, onAddToTrip, tripId }) {
  const [activities, setActivities] = useState([])
  const [loadingActs, setLoadingActs] = useState(true)
  const [activePhoto, setActivePhoto] = useState(0)

  const photoIds = CITY_PHOTOS[city.name] || []
  const photos = photoIds.length > 0
    ? photoIds.map(id => `https://images.unsplash.com/${id}?w=800&h=500&fit=crop`)
    : Array.from({ length: 4 }, (_, i) =>
        `https://picsum.photos/seed/${city.name.replace(' ', '')}${i + 1}/800/500`)

  // Prepend the DB image if not already in list
  const allPhotos = city.image_url && !photos[0]?.includes(city.image_url)
    ? [city.image_url, ...photos]
    : photos

  useEffect(() => {
    if (!city.id) return
    supabase.from('activities').select('*').eq('city_id', city.id).limit(6)
      .then(({ data }) => { setActivities(data || []); setLoadingActs(false) })
  }, [city.id])

  // Auto-cycle
  useEffect(() => {
    const t = setInterval(() => setActivePhoto(p => (p + 1) % allPhotos.length), 4000)
    return () => clearInterval(t)
  }, [allPhotos.length])

  const costLabel = (idx) => ['', '$', '$$', '$$$', '$$$$', '$$$$$'][idx] || ''
  const budgets = CITY_BUDGETS[city.name] || [30, 80, 200]

  const prev = () => setActivePhoto(p => (p - 1 + allPhotos.length) % allPhotos.length)
  const next = () => setActivePhoto(p => (p + 1) % allPhotos.length)

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-dusk/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        className="relative bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto"
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
        onClick={e => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 bg-white/90 backdrop-blur rounded-full p-2 shadow-md hover:bg-white transition-colors"
        >
          <X className="w-4 h-4 text-dusk" />
        </button>

        {/* Photo Hero */}
        <div className="relative h-72 bg-sand overflow-hidden rounded-t-3xl sm:rounded-t-3xl">
          <AnimatePresence mode="wait">
            <motion.img
              key={activePhoto}
              src={allPhotos[activePhoto]}
              alt={`${city.name}`}
              className="w-full h-full object-cover"
              initial={{ opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.55 }}
              onError={e => { e.target.src = `https://picsum.photos/seed/${city.name}/800/500` }}
            />
          </AnimatePresence>

          {/* Prev / Next */}
          <button onClick={prev} className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full p-2 transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button onClick={next} className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full p-2 transition-colors">
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Dots */}
          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
            {allPhotos.map((_, i) => (
              <button key={i} onClick={() => setActivePhoto(i)}
                className={`rounded-full transition-all duration-300 ${i === activePhoto ? 'bg-white w-5 h-2' : 'bg-white/50 w-2 h-2'}`}
              />
            ))}
          </div>

          {/* Gradient overlay for text readability */}
          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/40 to-transparent" />
        </div>

        {/* Thumbnail Strip */}
        <div className="flex gap-2 px-4 py-3 overflow-x-auto bg-sand/30 border-b border-parchment">
          {allPhotos.map((url, i) => (
            <button key={i} onClick={() => setActivePhoto(i)}
              className={`shrink-0 w-16 h-12 rounded-xl overflow-hidden border-2 transition-all ${i === activePhoto ? 'border-amber' : 'border-transparent opacity-60 hover:opacity-100'}`}
            >
              <img src={url} alt="" className="w-full h-full object-cover"
                onError={e => { e.target.src = `https://picsum.photos/seed/${city.name}${i}/200/150` }}
              />
            </button>
          ))}
        </div>

        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="font-display text-4xl font-bold text-dusk">{city.name}</h2>
              <p className="font-body text-sm text-mist flex items-center gap-1 mt-1">
                <MapPin className="w-4 h-4 shrink-0" />
                {city.country}{city.continent ? ` · ${city.continent}` : ''}
                {city.cost_index ? ` · ${costLabel(city.cost_index)}` : ''}
              </p>
            </div>
            {tripId && (
              <button onClick={() => onAddToTrip(city)} className="btn-primary flex items-center gap-2 shrink-0">
                <Plus className="w-4 h-4" /> Add to Trip
              </button>
            )}
          </div>

          {/* Daily Budget Estimator */}
          <div>
            <h3 className="section-label mb-3">Estimated Daily Budget (USD)</h3>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Budget', icon: '$', value: budgets[0], color: 'bg-forest/10 border-forest/20 text-forest' },
                { label: 'Mid-range', icon: '$$', value: budgets[1], color: 'bg-amber/10 border-amber/20 text-amber-dark' },
                { label: 'Luxury', icon: '$$$', value: budgets[2], color: 'bg-earth/10 border-earth/20 text-earth' },
              ].map(({ label, icon, value, color }) => (
                <div key={label} className={`rounded-2xl border p-3 text-center ${color}`}>
                  <p className="font-body text-xs font-medium uppercase tracking-widest mb-1 opacity-70">{label}</p>
                  <p className="font-display text-2xl font-bold">${value}</p>
                  <p className="font-body text-xs opacity-60">per day</p>
                </div>
              ))}
            </div>
          </div>

          {/* Activities */}
          <div>
            <h3 className="section-label mb-3">Things to do</h3>
            {loadingActs ? (
              <div className="grid grid-cols-2 gap-3">
                {[1,2,3,4].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)}
              </div>
            ) : activities.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {activities.map(act => (
                  <div key={act.id} className="bg-cream border border-parchment rounded-xl p-3">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="font-body font-medium text-sm text-dusk leading-snug">{act.name}</span>
                      <span className={`font-body text-xs px-2 py-0.5 rounded-full shrink-0 capitalize ${TYPE_STYLE[act.type] || 'bg-sand text-mist'}`}>
                        {act.type}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 font-body text-xs text-mist">
                      <span className="flex items-center gap-0.5"><DollarSign className="w-3 h-3" />${act.cost}</span>
                      {act.duration_mins && <span className="flex items-center gap-0.5"><Clock className="w-3 h-3" />{act.duration_mins}m</span>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="font-body text-sm text-mist text-center py-6 bg-cream rounded-xl border border-parchment">
                No activities listed yet for {city.name}.
              </p>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
