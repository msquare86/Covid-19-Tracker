import React, { useState, useEffect } from 'react'
import {
  MenuItem,
  FormControl,
  Select,
  Card,
  CardContent,
} from '@material-ui/core'
import InfoBox from './InfoBox'
import Map from './Map'
import './App.css'
import Table from './Table'
import { sortData, prettyPrintStat } from './util'
import LineGraph from './LineGraph'
import 'leaflet/dist/leaflet.css'
function App() {
  const [countries, setcountries] = useState([])
  const [country, setcountry] = useState('Global')
  const [countryInfo, setcountryInfo] = useState({})
  const [tableData, settableData] = useState([])
  const [mapCenter, setmapCenter] = useState({ lat: 34.8076, lng: -40.4796 })
  const [mapCountries, setmapCountries] = useState([])
  const [mapZoom, setmapZoom] = useState(3)
  const [casesType, setcasesType] = useState('cases')
  useEffect(() => {
    fetch('https://disease.sh/v3/covid-19/all')
      .then((response) => response.json())
      .then((data) => {
        setcountryInfo(data)
      })
  }, [])
  useEffect(() => {
    const getCountriesData = async () => {
      await fetch('https://disease.sh/v3/covid-19/countries')
        .then((response) => response.json())
        .then((data) => {
          const countries = data.map((country) => ({
            name: country.country,
            value: country.countryInfo.iso2,
          }))
          const sortedData = sortData(data)
          settableData(sortedData)
          setmapCountries(data)
          setcountries(countries)
        })
    }
    getCountriesData()
  }, [])

  const onchangeCountry = async (event) => {
    const countryCode = event.target.value

    const url =
      countryCode === 'Global'
        ? 'https://disease.sh/v3/covid-19/all'
        : `https://disease.sh/v3/covid-19/countries/${countryCode}`
    await fetch(url)
      .then((response) => response.json())
      .then((data) => {
        setcountry(countryCode)
        setcountryInfo(data)
        setmapCenter([data.countryInfo.lat, data.countryInfo.long])
        setmapZoom(4.5)
      })
  }
  console.log(countryInfo)
  return (
    <div className="app">
      <div className="app__left">
        <div className="app__header">
          <h1>COVID-19 TRACKER</h1>
          <FormControl className="app__dropdown">
            <Select
              variant="outlined"
              onChange={onchangeCountry}
              value={country}
            >
              <MenuItem value="Global">Global</MenuItem>
              {countries.map((country) => (
                <MenuItem value={country.value}>{country.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>

        <div className="app__starts">
          <InfoBox
            isRed
            active={casesType === 'cases'}
            onClick={(e) => setcasesType('cases')}
            title="Coronavirus cases"
            cases={prettyPrintStat(countryInfo.todayCases)}
            total={prettyPrintStat(countryInfo.cases)}
          />
          <InfoBox
            active={casesType === 'recovered'}
            onClick={(e) => setcasesType('recovered')}
            title="Recovered"
            cases={prettyPrintStat(countryInfo.todayRecovered)}
            total={prettyPrintStat(countryInfo.recovered)}
          />
          <InfoBox
            isRed
            active={casesType === 'deaths'}
            onClick={(e) => setcasesType('deaths')}
            title="Deaths"
            cases={prettyPrintStat(countryInfo.todayDeaths)}
            total={prettyPrintStat(countryInfo.deaths)}
          />
        </div>
        <Map
          caseType={casesType}
          countries={mapCountries}
          center={mapCenter}
          zoom={mapZoom}
        />
      </div>
      <Card className="app__right">
        <CardContent>
          <h3>Live Cases By Country</h3>
          <Table countries={tableData} />
          <h3 className="app__graphTitle">Live Cases {casesType}</h3>
          <LineGraph classNamae="app__graph" casesType={casesType} />
        </CardContent>
      </Card>
    </div>
  )
}

export default App
