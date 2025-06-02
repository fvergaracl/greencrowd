import { useEffect, useState } from "react"
import { saveAs } from "file-saver"
import { useTranslation } from "@/hooks/useTranslation"
import axios from "axios"
import { getApiBaseUrl } from "@/config/api"
import Swal from "sweetalert2"

const ExportAreaKMLForm = () => {
  const { t } = useTranslation()
  const [areas, setAreas] = useState<any[]>([])
  const [selectedAreaIds, setSelectedAreaIds] = useState<string[]>([])
  const [campaignId, setCampaignId] = useState<string>("")
  const [campaigns, setCampaigns] = useState<any[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [areasRes, campaignsRes] = await Promise.all([
          axios.get(`${getApiBaseUrl()}/admin/areas`),
          axios.get(`${getApiBaseUrl()}/admin/campaigns/areas`)
        ])
        setAreas(areasRes.data)
        setCampaigns(campaignsRes.data)
      } catch (error) {
        console.error("Error fetching data", error)
      }
    }
    fetchData()
  }, [])

  const handleExport = () => {
    if (!selectedAreaIds.length) {
      Swal.fire(
        t("No areas selected"),
        t("Please select at least one area."),
        "warning"
      )
      return
    }

    const selectedAreas = areas.filter(area =>
      selectedAreaIds.includes(area.id)
    )

    let kml =
      `<?xml version="1.0" encoding="UTF-8"?>\n` +
      `<kml xmlns="http://www.opengis.net/kml/2.2">\n` +
      `<Document>\n`

    selectedAreas.forEach(area => {
      const coordinates = area.polygon
        .map((coord: number[]) => `${coord[1]},${coord[0]},0`)
        .join(" ")

      kml += `
      <Placemark>
        <name>${area.name}</name>
        <description>${area.description || ""}</description>
        <ExtendedData>
          <Data name="campaignId">
            <value>${area.campaignId}</value>
          </Data>
        </ExtendedData>
        <Polygon>
          <outerBoundaryIs>
            <LinearRing>
              <coordinates>
                ${coordinates}
              </coordinates>
            </LinearRing>
          </outerBoundaryIs>
        </Polygon>
      </Placemark>
      `
    })

    kml += `</Document>\n</kml>`

    const blob = new Blob([kml], {
      type: "application/vnd.google-earth.kml+xml"
    })
    saveAs(blob, "exported-areas.kml")
  }

  const handleSelectArea = (id: string) => {
    setSelectedAreaIds(prev =>
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    )
  }

  return (
    <div className='bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md'>
      <h2 className='text-xl font-semibold mb-4'>{t("Export Areas to KML")}</h2>

      <div className='mb-4'>
        <label className='block text-sm font-medium mb-1'>
          {t("Select Campaign")}
        </label>
        <select
          value={campaignId}
          onChange={e => setCampaignId(e.target.value)}
          className='w-full p-2 border border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white'
        >
          <option value=''>{t("All Campaigns")}</option>
          {campaigns.map(c => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className='mb-4 max-h-64 overflow-y-auto border p-2 rounded dark:border-gray-700'>
        {areas
          .filter(a => !campaignId || a.campaignId === campaignId)
          .map(area => (
            <div key={area.id} className='flex items-center gap-2 py-1'>
              <input
                type='checkbox'
                checked={selectedAreaIds.includes(area.id)}
                onChange={() => handleSelectArea(area.id)}
              />
              <div>
                <div className='font-semibold'>{area.name}</div>
                <div className='text-sm text-gray-500 dark:text-gray-400'>
                  {area.description}
                </div>
              </div>
            </div>
          ))}
      </div>

      <button
        onClick={handleExport}
        className='mt-4 w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded focus:ring focus:ring-green-300 dark:bg-green-700 dark:hover:bg-green-600'
      >
        {t("Export Selected Areas")}
      </button>
    </div>
  )
}

export default ExportAreaKMLForm
