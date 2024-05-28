require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
// const passportLocalMongoose = require('passport-local-mongoose');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const { config, configDotenv } = require('dotenv');
const axios = require('axios');
const Razorpay = require('razorpay');
const multer = require('multer');
const { type } = require('os');
const app = express();
const PORT = 3000;
const findOrCreate = require('mongoose-findorcreate');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const passportLocalMongoose = require('passport-local-mongoose');

// Set up view engine (assuming you're using EJS)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// Body parser middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Connect to MongoDB

mongoose.connect(process.env.MONGO_URL)

const userSchema = new mongoose.Schema({
    username: String,
    password: String,
    phone: Number,
    nameU: String,
    dob: String,
    firstLetterOfUser: String,
    googleId: String,
    details: [{
        ownerDetails: {
            nameOfHouseOwner: String,
            emailOfOwner: String,
            phnNumberCode:String,
            ownerPhnNumber: String,
            pincodeOfOwner: Number,
            propertyType:String,
            rentOrSell:String,
            cityName:String
        },
        propertyDetails: {
            propertyAddress: String,
            propertySize: String,
            minPrice: Number,
            maxPrice: Number,
            propertyDescription: String,
            propertyType: String,
        },
        propertyImages: [
            {
                name: String,
                data: Buffer,
                contentType: String,
            },
        ],
    }],
});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

const User = mongoose.model('User', userSchema);
 
 
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

 
const emailForAdd = new mongoose.Schema ({
    emailAdvertise:String
})
const emailAdvertise = mongoose.model('userAdd',emailForAdd)

app.use(session({
    secret: 'yourdfijsukghruheuuklsfdnksdhskndsdnngfdggfdghgfdgsfdfhjtyktesegeswehrhmcskksksfshfbsbhdhdebfhsdhz',
    resave: false,
    saveUninitialized: true
}));

 

app.use(passport.initialize());
app.use(passport.session());

// passport.use(User.createStrategy());

// passport.serializeUser(function (user, done) {
//     done(null, user.id);
// });

// passport.deserializeUser(function (id, done) {
//     User.findById(id, function (err, user) {
//         done(err, user);
//     });
// });

// passport.deserializeUser(function(id, done) {
//   User.findById(id, function(err, user) {
//     done(err, user);
//   });
// // });

// passport.use(new GoogleStrategy({
//     clientID: process.env.CLIENT_ID,
//     clientSecret: process.env.CLIENT_SECRET,
//     callbackURL: "http://localhost:3000/auth/google/chat-app",
//     userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
// },
//     function (accessToken, refreshToken, profile, cb) {
//         console.log(profile.displayName);
//         User.findOrCreate({ googleId: profile.id }, function (err, user) {
//             return cb(err, user);
//         });
//     }
// ));

//===========SUCCESSFULLY MADE AUTHENTIATION FOR LOGIN WITH GOOGLE============//

// app.get("/auth/google",
//     passport.authenticate("google", { scope: ["profile"] })
// );

// app.get("/auth/google/chat-app",
//     passport.authenticate("google", { failureRedirect: "/" }),
//     function (req, res) {
//         res.render("index", { messForClient: "Successfully logged in with Google" });
//     }
// );

app.get('/', async (req, res) => {
    try {
        const userId = req.session.userId;
        if (!userId) {
            res.render('index', { messForClient: "Login please..." });
        }
    } catch (error) {
        console.log(error);
    }
});

app.get('/home',async (req, res) => {
    try {
        const userId = req.session.userId;
        if (!userId) {
            res.render('index', { messForClient: "Login please..." });
        }
        
        else {
            res.render('index')
        }
    } catch (error) {
        console.log(error);
    }
});



app.get('/RentEase-about-us', (req, res) => {
    res.render('RentEase-about-us');
});

app.get("/your-property-listing",checkLogin, async (req, res) => {
    try {
        const userId = req.session.userId;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).send('User not found');
        }

        let propertyListings = user.details.map((detailOfProperty) => {
            return {
                ownerDetails: detailOfProperty.ownerDetails,
                propertyDetails: detailOfProperty.propertyDetails,
                propertyImages: detailOfProperty.propertyImages
            };
        });
 

        res.render('yourpropertylisting', { propertyListings });

    } catch (error) {
        console.error("Error retrieving property listings:", error);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/approvalsuccess',(req,res) => {
    res.render('approvalsuccess')
})

app.get('/requestsent',(req,res)=> {
    res.render('requestsent')
})

function checkLogin(req, res, next) {
    if (!req.session.userId) {
        setTimeout(() => {
            res.render('index', { messForClient: "You are not logged in to perform this activity..." });
        }, 2000);
    } else {
        next();
    }
}
// POST request for sending email OTP
app.post('/send-email-otp', async (req, res) => {
    try {
        const username = req.body.username;
        const otp = (Math.random() * 10000).toFixed(0);
        req.session.otp = otp;

        const transporter = nodemailer.createTransport({
            host: process.env.hostEmail, 
            port: 587,
            secure: false,
            auth: {
                user: process.env.userEmail,
                pass: process.env.passEmail
            }
        });

        const mailOptions = {
            from: 'yashsabne39@gmail.com',
            to: username,
            subject: `OTP for registration`,
            html: `<p>Hello ${username},</p><p>Nice to see you here. Here is your OTP for login: <strong>${otp}</strong></p>`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error(error);
                return res.status(500).send('Error sending email');
            } else {
                // console.log('Email sent: ' + info.response);
                return res.status(200).send('Email sent successfully');
            }
        });
    } catch (e) {
        console.log("Error occurred", e);
        res.status(500).json({ error: 'Error sending OTP' });
    }
});

app.post("/verify-otp", (req, res) => {
    const { username, otp } = req.body;
    if (otp === req.session.otp) {
        res.json({ success: true });
    } else {
        res.json({ success: false });
    }
});

// POST request for registration
app.post("/register", async function (req, res) {
    const username = req.body.username;
    const newUser = new User({
        username: req.body.username,
        password: req.body.password,
        phone: req.body.phone,
        nameU: req.body.fullName,
        dob: req.body.dob,
        firstLetterOfUser: username.charAt(0)
    });

    try {
        const foundUser = await User.findOne({ username });
        if (foundUser) {
            return  ("User already exists");
        }
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        newUser.password = hashedPassword;
        await newUser.save();
        res.render("index", { messForClient: "registered successfully, please login..." });
    } catch (err) {
        console.error(err);
        res.status(500).render("error", { errorMessage: "Internal Server Error" });
    }
});

// POST request for login
app.post("/login", async function (req, res) {
    try {
        const username = req.body.username;
        const password = req.body.password;
        const foundUser = await User.findOne({ username });
        if (foundUser) {
            const passwordMatch = await bcrypt.compare(password, foundUser.password);
            if (passwordMatch) {
                req.session.userId = foundUser._id;
                req.session.save();
                const user = await User.findById(req.session.userId);
                res.render("index", { messForClient: "Welcome... " + user.nameU });
            } else {
                res.render("index", { errorMessage: "Incorrect username or password" });
            }
        } else {
            res.render("index", { errorMessage: "User not found" });
        }
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Error destroying session:', err);
        }
        res.render('index', { messForClient: "Logged out successfully" });
    });
    if (!req.session) {
        res.render('index', { messForClient: "You are not logged in..." });
    }
});

app.get('/rent-sell-home', checkLogin, (req, res) => {
    const page = req.query.page || 'firstpage';
    if (page === 'firstpage') {
        res.render('rentHome');
    } else if (page === 'secondPage') {
        res.render('secondRent');
    } else if (page === 'thirdPage') {
        res.render('thirdRent');
    } else {
        res.render('index', { messForClient: "Invalid page request" });
    }
});

app.post('/rent-sell-home/submit-first', checkLogin, async (req, res) => {
    try {
        const { nameOfHouseOwner, emailOfOwner,country, ownerPhnNumber, pincodeOfOwner,propertyType,rentOrSell,cityName } = req.body;
        
        req.session.ownerDetails = { nameOfHouseOwner, emailOfOwner,country, ownerPhnNumber, pincodeOfOwner,propertyType,rentOrSell,cityName, };
        res.redirect('/rent-sell-home?page=secondPage');
    } catch (error) {
        console.error('Error processing owner details:', error);
        res.status(500).render('error', { errorMessage: "Error processing owner details" });
    }
});
 
app.post('/rent-sell-home-secondePage', checkLogin, async (req, res) => {
    try {
        const { propertyAddress, minPrice, maxPrice, propertyDescription, propertySize, propertyType } = req.body;
        req.session.propertyDetails = { propertyAddress, propertySize, minPrice, maxPrice, propertyDescription, propertyType };
        res.redirect('/rent-sell-home?page=thirdPage');
    } catch (error) {
        console.error('Error processing property details:', error);
        res.status(500).render('error', { errorMessage: "Error processing property details" });
    }
});

 
app.post('/rent-sell-home/submit-third', checkLogin, upload.array('propertyImage', 3), async (req, res) => {
    if (!req.files || req.files.length < 3) {
        return res.status(400).json({ message: 'Please upload at least 3 photos.' });
    }
    try {
        const images = req.files.map(file => ({
            name: file.originalname,
            data: file.buffer,
            contentType: file.mimetype
        }));
        req.session.propertyImages = images;
        res.json({ message: 'Images uploaded successfully.' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.post('/rent-sell-home/final-submit', checkLogin, async (req, res) => {
    try {
        const userId = req.session.userId;
        const user = await User.findById(userId);
        const ownerDetails = req.session.ownerDetails;
        const propertyDetails = req.session.propertyDetails;
        const propertyImage = req.session.propertyImage;

        user.details.push({
            ownerDetails,
            propertyDetails,
            propertyImages 
        });
        await user.save();
        // Clear session data after saving to database
        req.session.ownerDetails = null;
        req.session.propertyDetails = null;
        req.session.propertyImage = null;

        res.redirect('/thank-you');
    } catch (error) {
        console.error('Error processing final submission:', error);
        res.status(500).render('error', { errorMessage: "Error processing final submission" });
    }
});

app.get('/image/:id', async (req, res) => {
    try {
        const imageId = req.params.id;
        const user = await User.findOne({ 'details.propertyImages._id': imageId });

        if (!user) {
            return res.status(404).send('Image not found');
        }

        const image = user.details.reduce((acc, detail) => {
            const img = detail.propertyImages.id(imageId);
            return img ? img : acc;
        }, null);

        if (!image) {
            return res.status(404).send('Image not found');
        }

        res.set('Content-Type', image.contentType);
        res.send(image.data);
    } catch (error) {
        res.status(500).send(error.message);
    }
});


app.get('/thank-you', (req, res) => {
    res.render('thank-you');
});

app.get('/properties',checkLogin, async (req, res) => {
    try {
        let users;
        if (req.query.pincode || req.query.minPrice || req.query.maxPrice || req.query.rentOrSell) {
            users = await User.find({ 'details.propertyDetails': { $exists: true, $not: { $size: 0 } } });
        } else {
            users = await User.aggregate([
                { $match: { 'details.propertyDetails': { $exists: true, $not: { $size: 0 } } } },
                { $sample: { size: 10 } } // Fetch up to 10 random documents
            ]);
        }
        const loggedInUserId = req.session.userId; // Assuming you store the user ID in the session
        const properties = users.reduce((acc, user) => {
            user.details.forEach(detail => {
                const isOwner = loggedInUserId && user._id.equals(loggedInUserId);
                let includeProperty = true;
                // Filter by pincode
                if (req.query.pincode) {
                    includeProperty = includeProperty && detail.ownerDetails.pincodeOfOwner === parseInt(req.query.pincode);
                }
                // Filter by price range
                if (req.query.minPrice || req.query.maxPrice) {
          
                    if (req.query.minPrice) {
                        includeProperty = includeProperty && detail.propertyDetails.minPrice >= parseInt(req.query.minPrice);
                    }
                    if (req.query.maxPrice) {
                        includeProperty = includeProperty && detail.propertyDetails.maxPrice <= parseInt(req.query.maxPrice);
                    }
                }
                // Filter by property type (sell or rent)
                if (req.query.rentOrSell) {
                    includeProperty = includeProperty && detail.ownerDetails.rentOrSell === String(req.query.rentOrSell);
                }
                if(req.query.propertyType) {
                    includeProperty = includeProperty &&  detail.ownerDetails.propertyType === String(req.query.propertyType)
                }

                if(req.query.propertyTypeLive) {
                    includeProperty = includeProperty && detail.propertyDetails.propertyType === String(req.query.propertyTypeLive)
                }   
                if (includeProperty) {
                    acc.push({ userId: user._id,
                         propertyId: detail._id,
                          ...detail.propertyDetails,
                           ...detail.ownerDetails,
                             isOwner
                     });
                }
            });
            return acc;
        }, []);

        if (properties.length === 0) {
            return res.render('properties', { message: "No such property is available for this filter" });
        }

        res.render('properties', { properties ,loggedInUserId});
    } catch (error) {
        console.error('Error fetching properties:', error);
        res.status(500).render('error', { errorMessage: 'Internal Server Error' });
    }
});

let propertyId;
app.get('/property-details/:propertyId', checkLogin, async (req, res) => {
    try {
          propertyId = req.params.propertyId;
        const loggedInUserId = req.session.userId; // Assuming you store the user ID in the session

        const user = await User.findOne({ 'details._id': propertyId });

        if (!user) {
            return res.status(404).render('error', { errorMessage: 'Property not found' });
        }

        const property = user.details.id(propertyId);
        const isOwner = loggedInUserId && user._id.equals(loggedInUserId); // Check if the property belongs to the logged-in user
 
        res.render('property-details', { property, isOwner });
    } catch (error) {
        console.error('Error fetching property details:', error);
        res.status(500).render('error', { errorMessage: 'Internal Server Error' });
    }
});

app.post('/request-to-connect',async (req,res) => {
    try { 
        const userId = req.session.userId;
        const requestingUser = await User.findById(userId);
        const propertyOwner = await User.findOne({ 'details._id': propertyId });

        if (!propertyOwner) {
            return res.status(404).send('Property owner not found');
        }

        const property = propertyOwner.details.id(propertyId);
        const ownerEmail = property.ownerDetails.emailOfOwner;
        const ownerName = property.ownerDetails.nameOfHouseOwner
        const requestorEmail = requestingUser.username;
        requestorName = requestingUser.nameU

        const transporter = nodemailer.createTransport({
            host: 'smtp-relay.brevo.com',
            port: 587,
            secure: false,
            auth: {
                user: process.env.userEmail,
                pass: process.env.passEmail
            }
        });

        const mailOptions = {
            from: 'yashsabne39@gmail.com',
            to: ownerEmail,
            subject: 'Phone Number Request for Your Property',
            html: `<p>Dear ${ownerName}</p>

            <p>We are excited to inform you that a potential buyer/renter, <strong> ${requestorName}
             (${requestorEmail})</strong>, is interested in your property listed on RentEase. They have requested to connect with you to discuss further details and have asked for your phone number.</p>

            <p><strong>Caution:</strong> By clicking the link below, you will share your phone number with the requester, and their phone number will also be shared with you.</p>
                   <p>If you wish to share your phone number, please click the link below:</p>
                   <p><a href="http://localhost:3000/approve-connect/${propertyId}/${userId}">Approve Request</a></p>`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error(error);
                return res.status(500).send('Error sending email');
            } else { 

                res.render('requestsent')
               
            }
        });
    } catch (error) {
        console.error('Error processing request:', error);
        res.status(500).send('Internal Server Error');
    }
});
app.get('/approve-connect/:propertyId/:userId', async (req, res) => {
    try {
        const { propertyId, userId } = req.params;
        const propertyOwner = await User.findOne({ 'details._id': propertyId });
        const requestingUser = await User.findById(userId);

        if (!propertyOwner || !requestingUser) {
            return res.status(404).send('Property owner or requesting user not found');
        }

        const property = propertyOwner.details.id(propertyId);
        const ownerPhoneNumber = property.ownerDetails.ownerPhnNumber;
        const ownerEmail = property.ownerDetails.emailOfOwner;
        const requestorEmail = requestingUser.username;
        const requestorPhoneNumber = requestingUser.phone;

        const transporter = nodemailer.createTransport({
            host: 'smtp-relay.brevo.com',
            port: 587,
            secure: false,
            auth: {
                user: process.env.userEmail,
                pass: process.env.passEmail
            }
        });

        // Send email to requester with owner's phone number
        const mailOptionsToRequester = {
            from: 'yashsabne39@gmail.com',
            to: requestorEmail,
            subject: 'Approved: Phone Number Request for Property',
            html: `<p>Hello,</p>
                   <p>The owner has approved your request. The phone number is: ${ownerPhoneNumber}</p>`
        };

        // Send email to owner with requester's phone number
        const mailOptionsToOwner = {
            from: 'yashsabne39@gmail.com',
            to: ownerEmail,
            subject: 'Phone Number Request Approved',
            html: `<p>Hello,</p>
                   <p>You have approved the phone number request. The requester's phone number is: ${requestorPhoneNumber}</p>`
        };

        // Send emails
        transporter.sendMail(mailOptionsToRequester, (error, info) => {
            if (error) {
                console.error(error);
                return res.status(500).send('Error sending email to requester');
            }
            console.log('Email sent to requester');
        });

        transporter.sendMail(mailOptionsToOwner, (error, info) => {
            if (error) {
                console.error(error);
                return res.status(500).send('Error sending email to owner');
            }
            // console.log('Email sent to owner: ' + info.response);
        });

        res.render('approvalsuccess');
        
    } catch (error) {
        console.error('Error processing approval:', error);
        res.status(500).send('Internal Server Error');
    }
});

 
 
const crypto = require('crypto');
 
const razorpay = new Razorpay({
    key_id: process.env.key_id,
    key_secret: process.env.key_secret
});

app.post('/api/razorpay/createOrder', async (req, res) => {
    const { amount, currency, receipt } = req.body;
    const options = {
        amount: 30 * 100, // Amount in paise
        currency: currency,
        receipt: receipt,
    };
    try {
        const order = await razorpay.orders.create(options);
        res.status(200).json(order);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/razorpay/verifyPayment', (req, res) => {
    const { order_id, payment_id, signature } = req.body;

    const hmac = crypto.createHmac('sha256', '52wVtPmspUXE25S68JMZDPdj');
    hmac.update(order_id + "|" + payment_id);
    const generatedSignature = hmac.digest('hex');

    if (generatedSignature === signature) {
        res.status(200).json({ success: true });
    } else {
        res.status(400).json({ success: false, message: 'Payment verification failed' });
    }
});

app.post('/got-number-onmail',async (req,res) => {
    try {
       
        const userId = req.session.userId;
        const user = await User.findById(userId)

        const onwerProperty = await User.findOne({ 'details._id': propertyId });

        const phnNumberOriginal = req.body.mobileNumber;

        const transporter = nodemailer.createTransport({
            host: process.env.hostEmail,
            port: 587,
            secure: false,
            auth: {
                user: process.env.userEmail,
                pass: process.env.passEmail
            }
        });


        const mailOptions = {

            from: 'yashsabne29@gmail.com',
            to: user.username,
            subject: `Contact Reveal Success,Got the Number `,
            html: ` <div style="font-family: Arial, sans-serif; line-height: 1.6;">
            <h2 style="color: #4CAF50;">Contact Revealed</h2>
            <p>Dear ${user.nameU},</p>
            <p>We hope this message finds you well. We have received a your payment successfully and phone number of owner is received to you</p>
            <div style="border-left: 4px solid #4CAF50; padding-left: 16px; margin: 20px 0;">
                <p><strong>Here is the number</strong> </p>
                <p>${phnNumberOriginal}</p>     
                <p>of the property owner having emailAddress :${onwerProperty.username} & name: ${onwerProperty.nameU} </p>
            </div>
       
            <p>Thank you for using our platform to list your property. We wish you the best in finding the perfect tenant/buyer.</p>
            <p>Best regards,</p>
            <p>The RentEase Team - YashDev</p>
        </div>`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error(error);
                return res.status(500).send('Error sending email');
            } else {
                // console.log('Email sent: ' + info.response);
                // return res.status(200).send('Email sent successfully');
                 
            }
        });
    } catch (error) {
        
    }

})

app.post("/get-contact", async function (req, res) {
     
    const newUser = new emailAdvertise({
        emailAdvertise: req.body.email,
 
    });

    try {
        const username = req.body.email;
        const foundUser = await emailAdvertise.findOne({ username });
        if (foundUser) {
            return res.send("User already exists");
        }
         
        await newUser.save();
        res.render("index", { messForClient: "Suscribed sucessfully for latest updates" });
    } catch (err) {
        console.error(err);
        res.status(500).render("error", { errorMessage: "Internal Server Error" });
    }
});

app.get("/termscondition",(req,res) => {
    res.render("termscondition")
})


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

 