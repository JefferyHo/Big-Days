import styled from "styled-components"

export default function Contact() {
  return <><pre style={{whiteSpace: 'pre-wrap'}}>{`
  【免责申明】
  
  欢迎使用本工具类网站！本网站为免费服务，以下是相关声明和使用条款：
  
  1. 数据存储与隐私  
     本网站采用 IndexedDB 技术，所有数据均存储于您的设备本地，绝不会上传至服务器。我们对您的数据隐私高度重视，但也请您妥善管理自己的设备和浏览器，防止数据丢失或被他人访问。
  
  2. 使用风险  
     本网站已尽力确保工具的准确性和可靠性，但无法完全避免潜在的技术问题或错误。使用过程中可能产生的任何直接或间接损失，网站开发者不承担法律责任。
  
  3. 服务保障  
     本网站不提供任何形式的服务保证（包括但不限于可用性、功能持续性等）。我们保留随时停止维护或关闭网站的权利，恕不另行通知。
  
  4. 用户责任  
     用户在使用本网站服务时，应遵守相关法律法规，不得利用本网站从事任何违法违规行为。
  
  【捐赠支持】
  
  如果您觉得本网站对您有所帮助，可以通过下方二维码支持我们，
  您的支持将帮助我们更好地优化和维护服务。感谢您的慷慨捐助！
  
  请扫描下方二维码进行捐赠：
  `}
  </pre>
  <ImgWrap>
    <Img src="src/assets/images/donate.jpg" />
  </ImgWrap>
  </>
}


const ImgWrap = styled.div`
  text-align: center;
  margin: .6rem 0;
`

const Img = styled.img`
  width: 120px;
  height: 120px;
  object-fit: contain;
`