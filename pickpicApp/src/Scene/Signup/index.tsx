import t from 'tcomb-form-native';

const Form = t.form.Form;

const User = t.struct({
    email: t.String,
    username: t.String,
    password: t.String,
    terms: t.Boolean
});