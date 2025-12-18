import '../css/donate.css';
import Navbar from "../components/Navbar";
import Footer from '../components/Footer';
import BackToTop from "../components/BackToTop";
import PageHeader from '../components/PageHeader';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

export default function Donate() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [recentLogin, setRecentLogin] = useState("");
    const [amount, setAmount] = useState(100);
    const [customAmount, setCustomAmount] = useState('');
    const [useCustomAmount, setUseCustomAmount] = useState(false);
    const [showPopup, setShowPopup] = useState(true);
    const [showLogin, setShowLogin] = useState(false);
    const [isLogin, setIsLogin] = useState(false);
    const [showPaymentPage, setShowPaymentPage] = useState(false);
    const [cardNumber, setCardNumber] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [cvv, setCvv] = useState('');
    const [cardName, setCardName] = useState('');
    const navigate = useNavigate();
    const MySwal = withReactContent(Swal);

    useEffect(() => {
        const loggedInUser = localStorage.getItem("NGO");
        if (loggedInUser) {
            setIsLogin(true);
            setShowPopup(false);
            setShowLogin(true);
            setPassword(loggedInUser);
            setEmail(atob(loggedInUser).split(':').at(0));
            fetchRecentLogin(loggedInUser, atob(loggedInUser).split(':').at(0));
        } else {
            setIsLogin(false);
        }
    }, []);


    const fetchRecentLogin = async (auth, mail) => {
        var options = {
            method: 'GET',
            url: 'http://localhost:5000/api/v1/registration/getLogs?email=' + mail,
            headers: {
                Authorization: `Basic ${auth}`,
                'Content-Type': 'application/json'
            },
        };
        await axios.request(options)
            .then((response) => { setRecentLogin(response.data);})
            .catch(() => { localStorage.removeItem('NGO'); alert("Server Authentication Failed!\nLogin Again."); window.location.reload(); });
    };

    function loadScript(src) {
        return new Promise((resolve) => {
            const script = document.createElement("script");
            script.src = src;
            script.onload = () => {
                resolve(true);
            };
            script.onerror = () => {
                resolve(false);
            };
            document.body.appendChild(script);
        });
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isLogin) {
            const loading = MySwal.fire({
                title: 'Initializing payment.',
                text: "Don't close or refresh the tab. Please Wait...",
                didOpen() {
                    MySwal.showLoading()
                },
                allowOutsideClick: false,
                allowEscapeKey: false,
                allowEnterKey: false
            });
            var result = {};
            var options = {
                method: 'POST',
                url: 'http://localhost:5000/api/v1/donate/pay',
                headers: {
                    Authorization: `Basic ${password}`,
                    'Content-Type': 'application/json'
                },
                data: { name: name, amount: amount },
            };

            await axios.request(options)
                .then(response => {
                    result = response.data;
                    loading.close();
                    // Show custom payment page
                    setShowPaymentPage(true);
                }).catch(error => {
                    console.error('Donation error:', error);
                    loading.close();
                    const errorMsg = error.response?.data?.message || error.message || 'Unknown error';
                    MySwal.fire({
                        title: "Server Error!",
                        text: `Error: ${errorMsg}`,
                        icon: "error"
                    });
                });


        } else {
            setShowPopup(true);
        }
    };
    const handleEmail = async () => {
        console.log('Checking email:', email);
        
        if (!email || email.trim() === '') {
            alert('Please enter an email address');
            return;
        }
        
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (regex.test(String(email).toLowerCase())) {
            try {
                const url = "http://localhost:5000/api/v1/registration?email=" + String(email).toLowerCase();
                console.log('Making request to:', url);
                
                const response = await axios.get(url);
                console.log('Response:', response.data);
                
                if (response.data === "Login") {
                    setShowLogin(true);
                } else {
                    localStorage.setItem('user', email);
                    navigate("/signup");
                }
            } catch (error) {
                console.error('API Error:', error);
                alert('Server error. Please check if your backend is running on port 5000.');
            }
        } else {
            alert("Please enter a valid email address");
        }
    };
    const handleLogin = async () => {
        const options = {
            method: 'POST',
            url: 'http://localhost:5000/api/v1/registration/auth',
            data: { email: email, password: password },
        };
        await axios.request(options)
            .then(response => {
                MySwal.fire({
                    icon: "success",
                    title: "Logged in Successfully!",
                    showConfirmButton: false,
                    timer: 2000
                }).then(() => { window.location.reload(); });
                localStorage.setItem('NGO', btoa(`${email}:${password}`));
                localStorage.removeItem("ADMIN_NGO");
                setShowPopup(false);
            })
            .catch(error => {
                alert(error.response.data);
            })
    };

    const handlePayment = async (e) => {
        e.preventDefault();
        // Simulate payment processing
        const loading = MySwal.fire({
            title: 'Processing Payment...',
            text: 'Please wait while we process your payment.',
            didOpen() {
                MySwal.showLoading()
            },
            allowOutsideClick: false
        });

        // Simulate 2 second processing time
        setTimeout(() => {
            loading.close();
            setShowPaymentPage(false);
            MySwal.fire({
                icon: "success",
                title: "Payment Successful!",
                text: `Thank you for your donation of ₹${amount}! Your transaction has been completed.`
            });
        }, 2000);
    };

    return (
        <>
            <Navbar />
            {showPopup ? <div className='popUp'>
                <div className='popup-content'>
                    <div className="closeBtn">
                        <button type="button" className="btn-close" aria-label="Close" onClick={() => { setShowPopup(!showPopup) }}></button>
                    </div>
                    <h1>Your Account</h1>
                    <h2>{showLogin ? 'Enter your password to LogIn' : `Enter your email to LogIn or Create an account.`}</h2>
                    <div className="form">
                        <input type="email" name="mail" id="mail" onChange={(e) => setEmail(e.target.value)} value={email} placeholder='Enter your email address' autoComplete='email' readOnly={showLogin} required />
                        {showLogin && <input type="password" name="pass" id="pass" placeholder='Enter your password' onChange={(e) => setPassword(e.target.value)} required />}
                        <button type="button" className="btn btn-success" onClick={showLogin ? handleLogin : handleEmail}>{showLogin ? "LogIn" : "Continue"}</button>
                    </div>
                </div>
            </div> : null}
            
            {/* Payment Page */}
            {showPaymentPage ? <div className='popUp'>
                <div className='popup-content' style={{maxWidth: '500px'}}>
                    <div className="closeBtn">
                        <button type="button" className="btn-close" aria-label="Close" onClick={() => setShowPaymentPage(false)}></button>
                    </div>
                    <h1>Payment Details</h1>
                    <div className="mb-3">
                        <h4>Donation Amount: ₹{amount}</h4>
                        <p>Donor: {name}</p>
                        <p>Email: {email}</p>
                    </div>
                    <form onSubmit={handlePayment}>
                        <div className="mb-3">
                            <label className="form-label">Cardholder Name</label>
                            <input 
                                type="text" 
                                className="form-control" 
                                value={cardName}
                                onChange={(e) => setCardName(e.target.value)}
                                placeholder="Enter cardholder name"
                                required 
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Card Number</label>
                            <input 
                                type="text" 
                                className="form-control" 
                                value={cardNumber}
                                onChange={(e) => setCardNumber(e.target.value)}
                                placeholder="1234 5678 9012 3456"
                                maxLength="19"
                                required 
                            />
                        </div>
                        <div className="row">
                            <div className="col-md-6 mb-3">
                                <label className="form-label">Expiry Date</label>
                                <input 
                                    type="text" 
                                    className="form-control" 
                                    value={expiryDate}
                                    onChange={(e) => setExpiryDate(e.target.value)}
                                    placeholder="MM/YY"
                                    maxLength="5"
                                    required 
                                />
                            </div>
                            <div className="col-md-6 mb-3">
                                <label className="form-label">CVV</label>
                                <input 
                                    type="text" 
                                    className="form-control" 
                                    value={cvv}
                                    onChange={(e) => setCvv(e.target.value)}
                                    placeholder="123"
                                    maxLength="3"
                                    required 
                                />
                            </div>
                        </div>
                        <button type="submit" className="btn btn-success w-100">Pay ₹{amount}</button>
                    </form>
                </div>
            </div> : null}
            
            <PageHeader title={"Donate Now"} path={"/donate"} name={"Donate"} />

            {/* <!-- Donate Start --> */}
            <div className="donations">
                <h2 className='logs' style={{backgroundColor:recentLogin?'whitesmoke':'transparent'}}>{recentLogin.length>0?`Last Login: ${recentLogin}`:<span>&#8203;</span>}</h2>
                <div className="container">
                    <div className="donate">
                        <div className="row align-items-center">
                            <div className="col-lg-7">
                                <div className="donate-content">
                                    <div className="section-header">
                                        <p>Donate Now</p>
                                        <h2>Let's donate to needy people for better lives</h2>
                                    </div>
                                    <div className="donate-text">
                                        <p>
                                            Lorem ipsum dolor sit amet elit. Phasellus nec pretium mi. Curabitur facilisis ornare velit non. Aliquam metus tortor, auctor id gravida, viverra quis sem. Curabitur non nisl nec nisi maximus. Aenean convallis porttitor. Aliquam interdum at lacus non blandit.
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-5">
                                <div className="donate-form">
                                    <form onSubmit={handleSubmit}>
                                        <div className="control-group">
                                            <input onChange={(e) => setName(e.target.value)} id='name' type="text" className="form-control" placeholder="Name" required autoComplete='name' />
                                        </div>
                                        <div className="control-group">
                                            <input onChange={(e) => setEmail(e.target.value)} value={email} id='email' type="email" className="form-control" placeholder="Email" disabled={showLogin} required autoComplete='email' />
                                        </div>
                                        <div className="btn-group" role="group" aria-label="Basic radio toggle button group">
                                            <input type="radio" className="btn-check" name="btnradio" id="btnradio1" defaultChecked onChange={() => {setAmount(100); setUseCustomAmount(false);}} />
                                            <label htmlFor='btnradio1' className="btn btn-custom btn-outline-warning"><i className='fa fa-indian-rupee' /> 100</label>

                                            <input type="radio" className="btn-check" name="btnradio" id="btnradio2" onChange={() => {setAmount(500); setUseCustomAmount(false);}} />
                                            <label htmlFor='btnradio2' className="btn btn-custom btn-outline-warning"><i className='fa fa-indian-rupee' /> 500</label>

                                            <input type="radio" className="btn-check" name="btnradio" id="btnradio3" onChange={() => {setAmount(1000); setUseCustomAmount(false);}} />
                                            <label htmlFor='btnradio3' className="btn btn-custom btn-outline-warning"><i className='fa fa-indian-rupee' /> 1000</label>

                                            <input type="radio" className="btn-check" name="btnradio" id="btnradio4" onChange={() => setUseCustomAmount(true)} />
                                            <label htmlFor='btnradio4' className="btn btn-custom btn-outline-warning">Custom</label>
                                        </div>
                                        {useCustomAmount && (
                                            <div className="control-group mt-3">
                                                <input 
                                                    type="number" 
                                                    className="form-control" 
                                                    placeholder="Enter custom amount" 
                                                    value={customAmount}
                                                    onChange={(e) => {setCustomAmount(e.target.value); setAmount(Number(e.target.value));}}
                                                    min="1"
                                                    required={useCustomAmount}
                                                />
                                            </div>
                                        )}
                                        <div>
                                            <button className="btn btn-custom" type="submit" style={{ borderRadius: "12px" }}>Donate Now</button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* <!-- Donate End --> */}
            <Footer />
            <BackToTop />
        </>
    );
}