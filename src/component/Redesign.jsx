import { Container, Col, Row, Button, FormControl } from 'react-bootstrap'

// eslint-disable-next-line react/prop-types
const Redesign = ( { localRef, remoteRef, callee,copyHandler,calleeId, isCopied,  createOffer } ) => {



  return (
   <section className="video-chat-section">
        <Container>
            <Row>
                <Col lg={6} className='p-sm-2 p-lg-5'>
                    <video style={{width:'400px', height:'400px'}} className='w-100 p-0 m-0 rounded' autoPlay playsInline ref={localRef}  ></video>
                    <Row>
                        <div className='px-3'>
                         <p className='mb-2 mt-3'>Copy your Key and share it to the person you want to start a video conference.</p>
                          <Button className='mt-2 w-100' onClick={copyHandler}>
                             Copy your unique key     {isCopied ? "👍" : ""}
                            </Button>                   
                        </div>
                                <h3 className='text-center mt-3'>OR</h3>

                            <Col className='d-flex align-items-center gap-3 mt-3 flex-column'>
                            <FormControl type='text' placeholder='Enter the conference key if you have it' onChange={calleeId} value={callee}/>  
                            <Button  onClick={createOffer} className='w-100' variant='success'>Invite</Button>
                             </Col>
                    </Row>
                </Col>
                <Col lg={6} className='p-5'>
                <video style={{width:'400px', height:'400px'}} className='w-100 p-0 m-0 rounded bg-dark' autoPlay playsInline ref={remoteRef}></video>
                </Col>
            </Row>
        </Container>
   </section>
  )
}

export default Redesign