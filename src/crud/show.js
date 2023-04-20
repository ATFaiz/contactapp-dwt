import { useState, useEffect } from 'react';
import React from 'react';
import { useParams, Link} from 'react-router-dom';
import mapboxgl from 'mapbox-gl';

export default function Show() {
   const [inputs, setInputs] = useState({});
  const { id } = useParams();
  const [location, setLocation] = useState({ lat: null, lng: null });
  
  useEffect(() => {
    const fetchContact = () => {
      const request = window.indexedDB.open('contacts-db', 2);

      request.onerror = function(event) {
        console.error('Database error: ' + event.target.errorCode);
      };
    
      request.onsuccess = function(event) {
        const db = event.target.result;
        const transaction = db.transaction(['contacts'], 'readonly');
        const store = transaction.objectStore('contacts');

        const requestGet = store.get(id);
        
        requestGet.onerror = function(event) {
          console.error('Database error: ' + event.target.errorCode);
        };
      
        requestGet.onsuccess = function(event) {
          const contact = event.target.result;
          if (contact) {
            setInputs({
              naame: contact.naame,
              email: contact.email,
              mobile: contact.mobile,
              image: contact.image,
            });
            setLocation(contact.location);
          }
        };
      };
    };

    fetchContact();
  }, [id]);

  useEffect(() => {
    mapboxgl.accessToken = 'pk.eyJ1IjoiYXRmYWl6Nzg2IiwiYSI6ImNsZzltdWh1eDE4ejMzbW85Z29jdTNqZDcifQ.0u07eZvLQUBxz3hBOsbj_Q';
    const map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [location.lng, location.lat],
      zoom: 14
    });
    new mapboxgl.Marker().setLngLat([location.lng, location.lat]).addTo(map);
    return () => {
      map.remove();
    };
  }, [location]);

const submitButton = () => {
  const message = `Name: ${inputs.naame}%0AEmail: 
  ${inputs.email}%0AMobile: ${inputs.mobile}`;

  const url = `sms:?&body=${encodeURIComponent(message)}`;
  window.location.href = url;
};
  return (
    <div className='s-container'>
        <header className='s-contact'>
          
          <Link to={'/contact'}>

                <i className="fas fa-chevron-circle-left s-back-btn"></i>
          </Link>
            <div className='s-contact-info'>
              <h4 className='name'>Contact Details</h4>
            </div>
          </header>
          <section className='s-info'>

          <div className='s-list__item'>
                  <span className='s-preview'>
            {inputs.image && (
                      <img
                        src={inputs.image}
                        className='s-img'
                        alt='contact'
                        width={90}
                        height={70}
                      />
                    )}
                    </span>
                  </div>

          <div className='s-info-line'>
                  <i className='fas fa-phone s-icon-gradient'></i>
                  <p className='s-type'>
                  {inputs.naame}
                  </p>
                  
                </div>
                <div className='s-info-line'>
                <i className='fas fa-envelope s-icon-gradient'></i>
                <p className='s-type'
                   title={inputs.email}>
                  {inputs.email}
                </p>
                 </div>

                <div className='s-info-line'>
                <i className='fas fa-sms s-icon-gradient'></i>
                <p className='s-type'>
                {inputs.mobile}
                </p>
                </div>           
                <div className='s-info-line' id='map' 
                style={{ height: '180px', width: '280px'}}></div>
          </section>

              <section className='s-button-container'>
              <div className='s-update'>
                <i  className='fas fa-check-circle s-icon-gradient'></i>
                <button 
                className='s-button'
                type='button'
                onClick={submitButton}
                >
                  SMS Contact
                </button>
              </div>
            </section>
    
    </div>
  );
}
