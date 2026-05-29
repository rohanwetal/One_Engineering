const mongoose=require('mongoose')

const userSchema=new mongoose.Schema(
    {
        name:{
            type:String,
            required:true
        },
        email:{
            type:String,
            required:true,
            unique:true
        },
        employeeId:{
            type:String,
            required:true,
            unique:true,
            validate:{
                validator: (v) => /^GEPL/i.test(v),
                message: 'Employee ID must start with GEPL (e.g. GEPL0001)'
            }
        },
        password:{
            type:String,
            required:true
        },
        role:{
            type:String,
            enum:['Employee','Manager(COE)','Admin'],
            required:true
        },
        managerEmployeeId:{
            type:String,
            default:null
        },
        department:{
            type:String,
            enum:[
                'Mechanical and System Integration',
                'Virtual Engineering Manufacturing',
                'Lean Manufacturing & Tool Design',
                'Electrical and Automation',
                'Hydraulics System Design',
                'Digital Tech. & Program Management',
                'Head of Engineering',
                'Admin',
            ],
            required:true
        }
    },
     {
        timestamps:true
    }
)

module.exports=mongoose.model('User',userSchema)
