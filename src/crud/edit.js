import React from 'react';
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Webcam from 'react-webcam';
import mapboxgl from 'mapbox-gl';

export default function Edit() {
  const navigate = useNavigate();
  const [inputs, setInputs] = useState({});
  const { id } = useParams();
  const [location, setLocation] = useState({ lat: null, lng: null });
  const [image, setImage] = useState(null);
  const webcamRef = useRef(null);
  const [showPreview, setShowPreview] = useState(false);
 
     const handleCapture = () => {
       const imageSrc = webcamRef.current.getScreenshot();
       setImage(imageSrc);
       setShowPreview(true);
     };
     const handleRetake = () => {
       setShowPreview(false);
       setImage(null);
     };

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
    
    const getLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setLocation({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            });
          },
          (error) => {
            console.log(error.message);
          }
        );
      } else {
        console.log('Geolocation is not supported by this browser.');
      }
    };
  

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
            });
            setLocation(contact.location);
            setImage(contact.image);
          }
        };
      };
    };

    fetchContact();
  }, [id]);

  const handleChange = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setInputs({ ...inputs, [name]: value });
  };


  const submitButton = () => {
    const request = window.indexedDB.open('contacts-db', 2);
  
    request.onerror = function(event) {
      console.error('Database error: ' + event.target.errorCode);
    };
    
    request.onsuccess = function(event) {
      const db = event.target.result;
      const transaction = db.transaction(['contacts'], 'readwrite');
      const store = transaction.objectStore('contacts');
  
      const requestGet = store.get(id);
      
      requestGet.onerror = function(event) {
        console.error('Database error: ' + event.target.errorCode);
      };
    
      requestGet.onsuccess = function(event) {
        const contact = event.target.result;
        if (contact) {
          let updatedImage = null;
          if (image) {
            updatedImage = image;
          } else {
            updatedImage = contact.image;
          }
          
          const updatedContact = {
            ...contact,
            ...inputs,
            location,
            image: updatedImage
          };
          const requestPut = store.put(updatedContact);
    
          requestPut.onerror = function(event) {
            console.error('Database error: ' + event.target.errorCode);
          };
    
          requestPut.onsuccess = function(event) {
            navigate('/contact');
          };
        }
      };
    };
  };

  return (
    <div className='e-container'>
        <header className='e-contact'>
          
          <Link to={'/contact'}>

                <i className="fas fa-chevron-circle-left e-back-btn"></i>
          </Link>
            <div className='e-contact-info'>
              <h4 className='name'>Edit Contact Detail</h4>
            </div>
          </header>
          <section className='e-info'>

          <div className='e-info-line'>
                  <i className='fas fa-phone e-icon-gradient'></i>
                  <input type='text' className='e-type form-control' 
                   name='naame'
                  value={inputs.naame || ''}
                  onChange={handleChange}
                  />
                </div>
                <div className='e-info-line '>
                <i className='fas fa-envelope e-icon-gradient'></i>
                  <input type='email' className='e-type form-control'
                   name='email'
                  value={inputs.email || ''}
                  onChange={handleChange}
                  />
                </div>

                <div className='e-info-line '>
                <i className='fas fa-sms e-icon-gradient'></i>
                  <input type='number' className='e-type form-control '
                  name='mobile'
                  value={inputs.mobile || ''}
                  onChange={handleChange}
                  />
                </div>
          </section>

          <section className='cc-button-container'>
                <div className='cc-info-line'>
                  {!showPreview ? (
                    <Webcam
                      audio={false}
                      ref={webcamRef}
                      screenshotFormat="image/jpeg"
                      width={210}
                      height={210}
                    />
                  ) : (
                    <img src={image} 
                    alt="Captured"
                    className='rounded'
                     />
                  )}
                </div>

                <div className='c-update'>
                <i  className='fa fa-camera c-icon-gradient'></i>
                  {!showPreview ? (
                    <button className='c-button' onClick={handleCapture}>
                      Capture
                    </button>
                  ) : (
                    <button className='c-button' onClick={handleRetake}>
                      Retake
                    </button>
                  )}
                </div>
            </section>

          <section className='e-button-container'>
                <div className='e-info-line'>
                <i  className='fas fa-check-circle e-icon-gradient'></i>
                <button type='button' onClick={getLocation} className='e-button'>
                Get Location
               </button>                </div>   
                <br/>
              <div className='s-info-line' id='map' style={{ height: '180px', width: '280px' }}></div>        
            </section>

            <section className='e-button-container'>
              <div className='e-update'>
                <i  className='fas fa-check-circle e-icon-gradient'></i>
                <button 
                className='e-button'
                type='button'
                onClick={submitButton}
                >
                  Save Contact
                </button>
              </div>
            </section>
  </div>
   );
}
