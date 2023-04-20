import { useState, useEffect } from 'react';
import React, { useRef }from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { v4 as uuid } from 'uuid';
import Webcam from 'react-webcam';
import mapboxgl from 'mapbox-gl';


export default function Create() {

  const navigate = useNavigate();
  const [naame, setNaame] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [location, setLocation] = useState({ lat: null, lng: null });
  const [image, setImage] = useState(null);
  const webcamRef = useRef(null);
  const [showPreview, setShowPreview] = useState(false);

  //set mobile validation
  const handleMobileChange = (e) => {
    const value = e.target.value;
    const newValue = value.replace(/[^\d]/g, ""); // remove any non-numeric characters
    if (newValue.length <= 11) { // set a limit of 11 digits
      setMobile(newValue);
    }
  };

  // A function to get the user's current location
  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(position => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      }, error => {
        console.error(error);
      });
    } else {
      console.error('Geolocation is not supported by this browser.');
    }
  };

  const handleCapture = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setImage(imageSrc);
    setShowPreview(true);
  };
  const handleRetake = () => {
    setShowPreview(false);
    setImage(null);
  };

  const submitButton = () => {
    if (!naame || !email || !mobile) {
      alert('Please fill in all required fields.');
      return;
    }
    
    const contact = {
      naame: naame,
      email: email,
      mobile: mobile,
      id: uuid(),
      location: location,
      image: image,
    };
    
    const request = window.indexedDB.open('contacts-db', 2);
  
    request.onerror = function(event) {
      console.error('Database error: ' + event.target.errorCode);
    };
  
    request.onsuccess = function(event) {
      const db = event.target.result;
      const transaction = db.transaction(['contacts'], 'readwrite');
      const store = transaction.objectStore('contacts');
  
      store.add(contact);
  
      transaction.oncomplete = function() {
        navigate('/contact');
      };
    };
  
    request.onupgradeneeded = function(event) {
      const db = event.target.result;
      const objectStore = db.createObjectStore('contacts', { keyPath: 'id' });
      objectStore.createIndex('naame', 'naame', { unique: false });
      objectStore.createIndex('email', 'email', { unique: true });
      objectStore.createIndex('mobile', 'mobile', { unique: false });
      objectStore.createIndex('location', 'location', { unique: false });
      objectStore.createIndex('image', 'image', { unique: false });
    };
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

  return (
    <div className='c-container'>
            <header className='c-contact'>
          
            <Link to={'/contact'}>

                  <i className="fas fa-chevron-circle-left c-back-btn"></i>
            </Link>
              <div className='c-contact-info'>
                <h4 className='name'>Create New Contact</h4>
              </div>
            </header>
            <section className='c-info'>

                <div className='c-info-line'>
                  <i className='fas fa-phone c-icon-gradient'></i>
                  <input type='text' className='c-type form-control' placeholder='Full Name'
                  title='name'
                  value={naame}
                  onChange={(e) => { setNaame(e.target.value) }}
                  />
                </div>

                <div className='c-info-line'>
                <i className='fas fa-envelope c-icon-gradient'></i>
                  <input type='email' className='c-type form-control' placeholder='Email'
                  title='email'
                  value={email}
                  onChange={(e) => { setEmail(e.target.value) }}
                  />
                </div>

                <div className='c-info-line'>
                <i className='fas fa-sms c-icon-gradient'></i>
                  <input type='number' className='c-type form-control' placeholder='Mobile Number'
                  title='mobile-number'
                  value={mobile || ''}
                  onChange={handleMobileChange}
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

            <section className='c-button-container'>
              <div className='c-update'>
                <i  className='fas fa-check-circle c-icon-gradient'></i>
                <button className='c-button'
                type='button'
                onClick={getLocation}
                >
                  Get Location
                  </button>
              </div>
              <br/>
              <div className='s-info-line' id='map' style={{ height: '180px', width: '280px' }}></div>
            </section>
            <section className='c-button-container'>
              <div className='c-update'>
                <i  className='fas fa-check-circle c-icon-gradient'></i>
                <button 
                className='c-button'
                type='button'
                onClick={submitButton}
                >
                  Save Contact
                </button>
              </div>
            </section>
    </div>
  )
}