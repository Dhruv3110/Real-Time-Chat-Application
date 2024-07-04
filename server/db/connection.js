const mongoose=require('mongoose')

const url='mongodb+srv://dhruvguptadg31:Abcde12345@cluster0.r9zn9op.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'
mongoose.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(()=> console.log('Connected to db')).catch((err)=> console.log('Error',err.message))