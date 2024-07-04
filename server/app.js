const express = require('express');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors= require('cors');
const io= require('socket.io')(8080, {
    cors: {
        origin: process.env.CLIENT_URL || "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});

require('./db/connection'); // Connect DB

// Import Files
const User = require('./models/User');
const Converse=require('./models/converse') 
const Message = require('./models/messages'); 
// const converse = require('./models/converse');

// App setup
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

const port = process.env.PORT || 8000;

// Socket.io
let users= []
io.on('connection', socket =>{
    socket.on('addUser', userId =>{
        const isUserExist = users.find(user => user.userId === userId);
        if(!isUserExist){
            const user={userId, socketId: socket.id }
            users.push(user)
            io.emit('getUsers', users)
        }
    });

    socket.on('sendMessage', async ({ senderId, receiverId, message, converseId }) => {
        const receiver = users.find(user => user.userId === receiverId);
        const sender = users.find(user => user.userId === senderId);
        const user = await User.findById(senderId);
        if (receiver) {
            io.to(receiver.socketId).to(sender.socketId).emit('getMessage', {
                senderId,
                message,
                converseId,
                receiverId,
                user: { id: user._id, fullName: user.fullName, email: user.email }
            });
            }else {
                io.to(sender.socketId).emit('getMessage', {
                    senderId,
                    message,
                    converseId,
                    receiverId,
                    user: { id: user._id, fullName: user.fullName, email: user.email }
                });
            }
        });

    socket.on('disconnect', ()=>{
        users=users.filter(user => user.socketId !== socket.id);
        io.emit('getUsers', users);
    });
    // io.emit('getUsers', socket.userId)
});

// GET route for the root path
app.get('/', (req, res) => {
    res.send('Welcome to the GET route');
});
// POST route for user registration
app.post('/api/register', async (req, res) => {
    try {
        const { fullName, email, password } = req.body;

        if (!fullName || !email || !password) {
            return res.status(400).send('Please fill all required fields');
        }

        const isAlreadyExist = await User.findOne({ email });
        if (isAlreadyExist) {
            return res.status(400).send('User already exists');
        }

        const hashedPassword = await bcryptjs.hash(password, 10);
        const newUser = new User({ fullName, email, password: hashedPassword });

        try {
            const savedUser = await newUser.save();
            const token = jwt.sign({ id: savedUser._id }, 'THIS_IS_A_JWT_SECRET_KEY', { expiresIn: '1h' });

            await User.updateOne({ _id: savedUser._id }, { token });
            
            return res.status(201).json({
                message: 'User registered successfully',
                user: {
                    _id: savedUser._id,
                    fullName: savedUser.fullName,
                    email: savedUser.email,
                    token
                }
            });
        } catch (saveError) {
            console.error(saveError);
            return res.status(500).send('Error saving user');
        }

    } catch (error) {
        console.error(error);
        return res.status(500).send('Server error');
    }
});

// Login endpoint
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).send('Please fill all required fields');
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).send('User email or password is incorrect');
        }

        const validateUser = await bcryptjs.compare(password, user.password);
        if (!validateUser) {
            return res.status(400).send('User email or password is incorrect');
        }

        const payload = {
            userId: user._id,
            email: user.email
        };
        const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || 'THIS_IS_A_JWT_SECRET_KEY';

        jwt.sign(payload, JWT_SECRET_KEY, { expiresIn: 84600 }, async (err, token) => {
            if (err) {
                return res.status(500).send('Error generating token');
            }

            await User.updateOne({ _id: user._id }, { token });

            return res.status(200).json({
                user: {
                    id: user._id,
                    email: user.email,
                    fullName: user.fullName,
                },
                token
            });
        });

    } catch (error) {
        console.error(error);
        return res.status(500).send('Server error');
    }
});


// POST route to create a conversation
app.post('/api/converse', async (req, res) => {
    try {
        const { senderId, receiverId } = req.body;
        if (!senderId || !receiverId) {
            return res.status(400).send('Please provide both senderId and receiverId');
        }
        const newConverse = new Converse({ members: [senderId, receiverId] });
        await newConverse.save();
        res.status(201).send('Conversation Created Successfully');
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

// GET route to get conversations of a user
app.get('/api/converse/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        const converses = await Converse.find({ members: { $in: [userId] } });

        const converseUserData = await Promise.all(converses.map(async (converse) => {
            const receiverId = converse.members.find((member) => member !== userId);
            const user = await User.findById(receiverId);
            if (!user) {
                throw new Error(`User with ID ${receiverId} not found`);
            }
            return {
                user: {
                    receiverId: user._id,
                    email: user.email,
                    fullName: user.fullName
                },
                converseId: converse._id
            };
        }));

        res.status(200).json(converseUserData);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

// POST route to send a message
app.post('/api/messages', async (req, res) => {
    try {
        const { converseId, senderId, message, receiverId='' } = req.body;
        if (!senderId || !message) {
            return res.status(400).send('Please provide all the required fields');
        }
        if(converseId ==='new' && receiverId){
            const newConverse = new Converse({ members: [senderId, receiverId] });
            await newConverse.save();
            const newMessage=new Message({converseId: newConverse._id, senderId, message})
            await newMessage.save();
            return res.status(201).send('Message sent successfully');
        }
        else if(!converseId && !receiverId){
            return res.status(400).send('Please Provide All Required Fields')
        }

        const newMessage = new Message({ converseId, senderId, message });
        await newMessage.save();
        res.status(200).send('Message sent successfully');

    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

// GET route to get messages of a conversation
app.get('/api/messages/:converseId', async (req, res) => {
    try {
        const checkMessages = async(converseId)=>{
            const messages = await Message.find({ converseId });
            const messageUserData = Promise.all(messages.map(async (message) => {
                const user = await User.findById(message.senderId);
                return { user: { id: user._id, email: user.email, fullName: user.fullName}, message: message.message};
            }));
            res.status(200).json(await messageUserData);
        }
        const converseId = req.params.converseId;
        if(converseId === 'new'){
            const checkConverse= await Converse.find({members: {$all: [req.query.senderId, req.query.receiverId]}});
            if(checkConverse.length>0){
                checkMessages(checkConverse[0]._id);
            }
            else{
                return res.status(200).json([])
            } 
        }
        else{
            checkMessages(converseId);
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

app.get('/api/users/:userId', async(req,res)=>{
    try{
        const userId = req.params.userId;
        const users = await User.find({_id: { $ne: userId}});
        const userData= await Promise.all(users.map(async(user)=>{
            return{ user:{email: user.email, fullName: user.fullName, receiverId: user._id}}
        }))
        res.status(200).json(userData);
    }
    catch(error){
        console.error(error);
        res.status(500).send('Server error');
    }
})

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});
