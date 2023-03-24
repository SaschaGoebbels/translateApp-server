/* eslint-disable */

export const resetPassword = async (password, passwordConfirm, resetToken) => {
  console.log('✅', password);
  try {
    const res = await fetch({
      method: 'POST',
      url: `https://127.0.0.1:3000/api/v1/users/resetPassword/${resetToken}`,
      data: { password, passwordConfirm }
    });
    console.log('✅', res);
  } catch {
    err => {
      console.log('❌', err);
      console.log('❌', err.response.data);
    };
  }
};
document.getElementById('passwordReset').addEventListener('click', e => {
  e.preventDefault();
  const password = document.getElementById('password').value;
  const passwordConfirm = document.getElementById('password').value;
  resetPassword(password, passwordConfirm);
});
