require("dotenv").config();const express=require("express"),mongoose=require("mongoose"),passport=require("passport"),LocalStrategy=require("passport-local").Strategy,session=require("express-session"),path=require("path"),fs=require("fs"),bcrypt=require("bcryptjs"),nodemailer=require("nodemailer"),bodyParser=require("body-parser"),{config:e,configDotenv:r}=require("dotenv"),axios=require("axios"),Razorpay=require("razorpay"),multer=require("multer"),{type:s}=require("os"),app=express(),PORT=3e3,findOrCreate=require("mongoose-findorcreate"),GoogleStrategy=require("passport-google-oauth20").Strategy,passportLocalMongoose=require("passport-local-mongoose");app.set("view engine","ejs"),app.set("views",path.join(__dirname,"views")),app.use(express.static(path.join(__dirname,"public"))),app.use(bodyParser.urlencoded({extended:!0})),app.use(bodyParser.json()),mongoose.connect(process.env.MONGO_URL);const userSchema=new mongoose.Schema({username:String,password:String,phone:Number,nameU:String,dob:String,firstLetterOfUser:String,googleId:String,details:[{ownerDetails:{nameOfHouseOwner:String,emailOfOwner:String,phnNumberCode:String,ownerPhnNumber:String,pincodeOfOwner:Number,propertyType:String,rentOrSell:String,rentpay:String,cityName:String},propertyDetails:{propertyAddress:String,propertySize:String,minPrice:Number,maxPrice:Number,propertyDescription:String,propertyType:String},propertyImages:[{name:String,data:Buffer,contentType:String}]},],notifications:[{message:String,timestamp:{type:Date,default:Date.now}}]});userSchema.plugin(passportLocalMongoose),userSchema.plugin(findOrCreate);const User=mongoose.model("User",userSchema),storage=multer.memoryStorage(),upload=multer({storage:storage}),emailForAdd=new mongoose.Schema({emailAdvertise:String}),emailAdvertise=mongoose.model("userAdd",emailForAdd);function checkLogin(t,o,a){t.session.userId?a():setTimeout(()=>{o.render("index",{messForClient:"You are not logged in to perform this activity..."})},2e3)}app.use(session({secret:"yourdfijsukghruheuuklsfdnksdhskndsdnngfdggfdghgfdgsfdfhjtyktesegeswehrhmcskksksfshfbsbhdhdebfhsdhz",resave:!1,saveUninitialized:!0})),app.use(passport.initialize()),app.use(passport.session()),app.get("/",async(t,o)=>{try{t.session.userId||o.render("index",{messForClient:"Login please..."})}catch(a){console.log(a)}}),app.get("/home",async(t,o)=>{try{let a=t.session.userId,n=await User.findById(a);a?o.render("index",{messForClient:"Welcome... "+n.nameU}):o.render("index",{messForClient:"Login please..."})}catch(i){console.log(i)}}),app.get("/RentEase-about-us",(t,o)=>{o.render("RentEase-about-us")}),app.get("/your-property-listing",checkLogin,async(t,o)=>{try{let a=await User.findById(t.session.userId);if(!a)return o.status(404).send("User not found");let n=a.details.map(t=>({propid:t._id,ownerDetails:t.ownerDetails,propertyDetails:t.propertyDetails,propertyImages:t.propertyImages}));o.render("yourpropertylisting",{propertyListings:n})}catch(i){console.error("Error retrieving property listings:",i),o.status(500).send("Internal Server Error")}}),app.get("/approvalsuccess",(t,o)=>{o.render("approvalsuccess")}),app.get("/requestsent",(t,o)=>{o.render("requestsent")}),app.post("/send-email-otp",async(t,o)=>{try{let a=t.body.username,n=(1e4*Math.random()).toFixed(0);t.session.otp=n;let i=nodemailer.createTransport({host:process.env.hostEmail,port:587,secure:!1,auth:{user:process.env.userEmail,pass:process.env.passEmail}}),p={from:"yashsabne39@gmail.com",to:a,subject:"OTP for registration",html:`<p>Hello ${a},</p><p>Nice to see you here. Here is your OTP for login: <strong>${n}</strong></p>`};i.sendMail(p,(t,a)=>t?(console.error(t),o.status(500).send("Error sending email")):o.status(200).send("Email sent successfully"))}catch(l){console.log("Error occurred",l),o.status(500).json({error:"Error sending OTP"})}}),app.post("/verify-otp",(t,o)=>{let{username:a,otp:n}=t.body;n===t.session.otp?o.json({success:!0}):o.json({success:!1})}),app.post("/register",async function(t,o){let a=t.body.username,n=new User({username:t.body.username,password:t.body.password,phone:t.body.phone,nameU:t.body.fullName,dob:t.body.dob,firstLetterOfUser:a.charAt(0)});try{if(await User.findOne({username:a}))return"User already exists";let i=await bcrypt.hash(t.body.password,10);n.password=i,await n.save(),o.render("index",{messForClient:"registered successfully, please login..."})}catch(p){console.error(p),o.status(500).render("error",{errorMessage:"Internal Server Error"})}}),app.post("/login",async function(t,o){try{let a=t.body.username,n=t.body.password,i=await User.findOne({username:a});if(i){if(await bcrypt.compare(n,i.password)){t.session.userId=i._id,t.session.save();let p=await User.findById(t.session.userId);o.render("index",{messForClient:"Welcome... "+p.nameU,loading:`<div class="spinner-border" role="status">
                 <span class="sr-only">Loading...</span>
               </div>`})}else o.render("index",{errorMessage:"Incorrect username or password"})}else o.render("index",{errorMessage:"User not found"})}catch(l){console.error(l),o.status(500).send("Internal Server Error")}}),app.get("/logout",(t,o)=>{t.session.destroy(t=>{t&&console.error("Error destroying session:",t),o.redirect("/")})}),app.get("/rent-sell-home",checkLogin,(t,o)=>{let a=t.query.page||"firstpage";"firstpage"===a?o.render("rentHome"):"secondPage"===a?o.render("secondRent"):"thirdPage"===a?o.render("thirdRent"):o.render("index",{messForClient:"Invalid page request"})}),app.post("/rent-sell-home/submit-first",checkLogin,async(t,o)=>{try{let{nameOfHouseOwner:a,emailOfOwner:n,country:i,ownerPhnNumber:p,pincodeOfOwner:l,propertyType:d,rentOrSell:c,cityName:u}=t.body;t.session.ownerDetails={nameOfHouseOwner:a,emailOfOwner:n,country:i,ownerPhnNumber:p,pincodeOfOwner:l,propertyType:d,rentOrSell:c,cityName:u},o.redirect("/rent-sell-home?page=secondPage")}catch(y){console.error("Error processing owner details:",y),o.status(500).render("error",{errorMessage:"Error processing owner details"})}}),app.post("/rent-sell-home-secondePage",checkLogin,async(t,o)=>{try{let{propertyAddress:a,minPrice:n,maxPrice:i,propertyDescription:p,propertySize:l,propertyType:d}=t.body;t.session.propertyDetails={propertyAddress:a,propertySize:l,minPrice:n,maxPrice:i,propertyDescription:p,propertyType:d},o.redirect("/rent-sell-home?page=thirdPage")}catch(c){console.error("Error processing property details:",c),o.status(500).render("error",{errorMessage:"Error processing property details"})}}),app.post("/rent-sell-home/submit-third",checkLogin,upload.array("propertyImage",5),async(t,o)=>{if(!t.files||t.files.length<5)return o.status(400).json({message:"Please upload at least 5 photos."});try{let a=t.files.map(t=>({name:t.originalname,data:t.buffer,contentType:t.mimetype}));t.session.propertyImages=a,o.json({message:"Images uploaded successfully."})}catch(n){o.status(500).json({message:n.message})}}),app.post("/rent-sell-home/final-submit",checkLogin,async(t,o)=>{try{let a=await User.findById(t.session.userId),n=t.session.ownerDetails,i=t.session.propertyDetails,p=t.session.propertyImages;a.details.push({ownerDetails:n,propertyDetails:i,propertyImages:p}),await a.save(),t.session.ownerDetails=null,t.session.propertyDetails=null,t.session.propertyImage=null,o.redirect("/thank-you")}catch(l){console.error("Error processing final submission:",l),o.status(500).render("error",{errorMessage:"Error processing final submission"})}}),app.get("/image/:id",async(t,o)=>{try{let a=t.params.id,n=await User.findOne({"details.propertyImages._id":a});if(!n)return o.status(404).send("Image not found");let i=n.details.reduce((t,o)=>o.propertyImages.id(a)||t,null);if(!i)return o.status(404).send("Image not found");o.set("Content-Type",i.contentType),o.send(i.data)}catch(p){o.status(500).send(p.message)}}),app.get("/thank-you",(t,o)=>{o.render("thank-you")}),app.get("/properties",checkLogin,async(t,o)=>{try{let a;a=t.query.pincode||t.query.minPrice||t.query.maxPrice||t.query.rentOrSell?await User.find({"details.propertyDetails":{$exists:!0,$not:{$size:0}}}):await User.aggregate([{$match:{"details.propertyDetails":{$exists:!0,$not:{$size:0}}}},{$sample:{size:20}}]);let n=t.session.userId,i=a.reduce((o,a)=>(a.details.forEach(i=>{let p=n&&a._id.equals(n),l=!0;t.query.pincode&&(l=l&&i.ownerDetails.pincodeOfOwner===parseInt(t.query.pincode)),(t.query.minPrice||t.query.maxPrice)&&(t.query.minPrice&&(l=l&&i.propertyDetails.minPrice>=parseInt(t.query.minPrice)),t.query.maxPrice&&(l=l&&i.propertyDetails.maxPrice<=parseInt(t.query.maxPrice))),t.query.rentOrSell&&(l=l&&i.ownerDetails.rentOrSell===String(t.query.rentOrSell)),t.query.propertyType&&(l=l&&i.ownerDetails.propertyType===String(t.query.propertyType)),t.query.propertyTypeLive&&(l=l&&i.propertyDetails.propertyType===String(t.query.propertyTypeLive)),l&&o.push({userId:a._id,propertyId:i._id,...i.propertyDetails,...i.ownerDetails,isOwner:p})}),o),[]);if(0===i.length)return o.render("properties",{message:"No such property is available for this filter"});o.render("properties",{properties:i,loggedInUserId:n})}catch(p){console.error("Error fetching properties:",p),o.status(500).render("error",{errorMessage:"Internal Server Error"})}});let propertyId;app.get("/property-details/:propertyId",checkLogin,async(t,o)=>{try{propertyId=t.params.propertyId;let a=t.session.userId,n=await User.findOne({"details._id":propertyId});if(!n)return o.status(404).render("error",{errorMessage:"Property not found"});let i=n.details.id(propertyId),p=a&&n._id.equals(a);o.render("property-details",{property:i,isOwner:p})}catch(l){console.error("Error fetching property details:",l),o.status(500).render("error",{errorMessage:"Internal Server Error"})}}),app.post("/request-to-connect",async(t,o)=>{try{t.body.nameofclient,t.body.emailofclient;let a=t.body.messageofclient,n=t.session.userId,i=await User.findById(n),p=await User.findOne({"details._id":propertyId});if(!p)return o.status(404).send("Property owner not found");let l=p.details.id(propertyId),d=l.ownerDetails.emailOfOwner,c=l.ownerDetails.nameOfHouseOwner,u=i.username;requestorName=i.nameU;let y={message:`You have <b> requested to connect </b> with <b> ${c} </b>. Please check your email for further details.`},m={message:`You have <b> request to connect </b> from <b> ${i.nameU} </b>. Please check your email for further details.`};i.notifications.unshift(y),p.notifications.unshift(m),i.notifications.length>10&&i.notifications.splice(10),p.notifications.length>10&&p.notifications.splice(10),await Promise.all([i.save(),p.save()]);let g=nodemailer.createTransport({host:"smtp-relay.brevo.com",port:587,secure:!1,auth:{user:process.env.userEmail,pass:process.env.passEmail}}),h={from:u,to:d,subject:"Phone Number Request for Your Property",html:`<p>Dear ${c}</p>

            <p>We are excited to inform you that a potential buyer/renter, <strong> ${requestorName}
             (${u})</strong>, is interested in your property listed on RentEase.
             <p><strong>message by ${requestorName}:</strong> ${a}</p>
             
             They have requested to connect with you to discuss further details and have asked for your phone number.</p>

            <p><strong>Caution:</strong> By clicking the link below, you will share your phone number with the requester, and their phone number will also be shared with you.</p>
                   <p>If you wish to share your phone number, please click the link below:</p>
                   <p><a href="http://localhost:3000/approve-connect/${propertyId}/${n}">Approve Request</a></p>`};g.sendMail(h,(t,a)=>{if(t)return console.error(t),o.status(500).send("Error sending email");o.render("requestsent")})}catch(f){console.error("Error processing request:",f),o.status(500).send("Internal Server Error")}}),app.get("/notification-of-user",checkLogin,async(t,o)=>{let a=(await User.findById(t.session.userId)).notifications;o.json(a)}),app.get("/approve-connect/:propertyId/:userId",async(t,o)=>{try{let{propertyId:a,userId:n}=t.params,i=await User.findOne({"details._id":a}),p=await User.findById(n);if(!i||!p)return o.status(404).send("Property owner or requesting user not found");let l=i.details.id(a),d=l.ownerDetails.ownerPhnNumber,c=l.ownerDetails.emailOfOwner,u=p.username,y=p.phone,m=nodemailer.createTransport({host:"smtp-relay.brevo.com",port:587,secure:!1,auth:{user:process.env.userEmail,pass:process.env.passEmail}}),g={from:"yashsabne39@gmail.com",to:u,subject:"Approved: Phone Number Request for Property",html:`<p>Hello,</p>
                   <p>The owner has approved your request. The phone number is: ${d}</p>`},h={from:"yashsabne39@gmail.com",to:c,subject:"Phone Number Request Approved",html:`<p>Hello,</p>
                   <p>You have approved the phone number request. The requester's phone number is: ${y}</p>`};m.sendMail(g,(t,a)=>{if(t)return console.error(t),o.status(500).send("Error sending email to requester");console.log("Email sent to requester")}),m.sendMail(h,(t,a)=>{if(t)return console.error(t),o.status(500).send("Error sending email to owner")}),o.render("approvalsuccess");let f={message:`you have <b> successfully approved ${p.nameU} for contact details </b>, check your email.`},b={message:`congrats! <b> you got approved by property owner ${i.nameU} for contact details </b>, check your email.`};i.notifications.unshift(f),p.notifications.unshift(b),i.notifications.length>10&&i.notifications.splice(10),p.notifications.length>10&&p.notifications.splice(10),await Promise.all([i.save(),p.save()])}catch(w){console.error("Error processing approval:",w),o.status(500).send("Internal Server Error")}});const crypto=require("crypto"),razorpay=new Razorpay({key_id:"rzp_test_SLeOOqQEvpGxpv",key_secret:"52wVtPmspUXE25S68JMZDPdj"});app.post("/api/razorpay/createOrder",async(t,o)=>{let{amount:a,currency:n,receipt:i}=t.body,p={amount:100*a,currency:n,receipt:i};try{let l=await razorpay.orders.create(p);o.status(200).json(l)}catch(d){o.status(500).json({error:d.message})}}),app.post("/api/razorpay/verifyPayment",(t,o)=>{let{order_id:a,payment_id:n,signature:i}=t.body,p=crypto.createHmac("sha256","52wVtPmspUXE25S68JMZDPdj");p.update(a+"|"+n),p.digest("hex")===i?o.status(200).json({success:!0}):o.status(400).json({success:!1,message:"Payment verification failed"})}),app.get("/get-phn-number",async(t,o)=>{let a=await User.findOne({"details._id":propertyId});o.json(a.phone)}),app.post("/delete-property",async(t,o)=>{let{propertyId:a}=t.body,n=t.session.userId;try{await User.findByIdAndUpdate(n,{$pull:{details:{_id:a}}}),o.redirect("/your-property-listing")}catch(i){console.error("Error deleting property:",i),o.status(500).send("Error deleting property")}}),app.post("/got-number-onmail",async(t,o)=>{try{let a=await User.findById(t.session.userId),n=await User.findOne({"details._id":propertyId});if(!a)return console.error("User not found"),o.status(404).json({success:!1,message:"User not found"});let i=t.body.originalMobileNumber,p=nodemailer.createTransport({host:process.env.hostEmail,port:587,secure:!1,auth:{user:process.env.userEmail,pass:process.env.passEmail}}),l={from:"yashsabne29@gmail.com",to:a.username,subject:"Contact Reveal Success, Got the Number",html:`
                <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                    <h2 style="color: #4CAF50;">Contact Revealed</h2>
                    <p>Dear ${a.nameU},</p>
                    <p>We hope this message finds you well. We have received your payment successfully and the phone number of the owner is received by you.</p>
                    <div style="border-left: 4px solid #4CAF50; padding-left: 16px; margin: 20px 0;">
                        <p><strong>Here is the number:</strong> </p>
                        <p>${i}</p>     
                        <p>of the property owner having email address: ${n.username} & name: ${n.nameU}</p>
                    </div>
                    <p>Thank you for using our platform to list your property. We wish you the best in finding the perfect tenant/buyer.</p>
                    <p>Best regards,</p>
                    <p>The RentEase Team - YashDev</p>
                </div>`};p.sendMail(l,(t,a)=>t?(console.error("Error sending email:",t),o.status(500).json({success:!1,message:"Error sending email"})):(console.log("Email sent:",a.response),o.status(200).json({success:!0,message:"Email sent successfully"})))}catch(d){return console.error("Error in /got-number-onmail endpoint:",d),o.status(500).json({success:!1,message:"Internal server error"})}}),app.post("/get-contact",async function(t,o){let a=new emailAdvertise({emailAdvertise:t.body.email});try{if(await emailAdvertise.findOne({username:t.body.email}))return o.send("User already exists");await a.save(),o.render("index",{messForClient:"Suscribed sucessfully for latest updates"})}catch(n){console.error(n),o.status(500).render("error",{errorMessage:"Internal Server Error"})}}),app.get("/thank-you-contact",(t,o)=>{o.render("thank-you-contact")}),app.get("/contact-us",(t,o)=>{o.render("contact-us")}),app.post("/contact-submit",async(t,o)=>{let{name:a,email:n,subject:i,message:p}=t.body;try{let l=require("nodemailer").createTransport({host:process.env.hostEmail,port:587,secure:!1,auth:{user:process.env.userEmail,pass:process.env.passEmail}}),d={from:n,to:"yashsabne39@gmail.com",subject:`Contact Form: ${i}`,text:`Name: ${a}
Email: ${n}
Message: ${p}`};l.sendMail(d,(t,a)=>{if(t)return console.error(t),o.status(500).send("Error sending email");console.log("Email sent: "+a.response)}),o.redirect("/thank-you-contact")}catch(c){console.error("Error sending contact form:",c),o.status(500).send("Something went wrong, please try again later.")}}),app.get("/termscondition",(t,o)=>{o.render("termscondition")}),app.listen(3e3,()=>{console.log("Server is running on http://localhost:3000")});
